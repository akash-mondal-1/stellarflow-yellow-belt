import { useState, useCallback } from 'react';
import * as StellarSdk from '@stellar/stellar-sdk';
import { useWallet } from '../contexts/WalletContext';
import { toast } from 'sonner';

export const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID || "";
export const XLM_CONTRACT_ID = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

const RPC_URL = import.meta.env.VITE_RPC_URL || "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = import.meta.env.VITE_NETWORK_PASSPHRASE || StellarSdk.Networks.TESTNET;

export const useStellar = () => {
  const { kit, address } = useWallet();
  const [server] = useState(() => new StellarSdk.rpc.Server(RPC_URL));

  const getCampaign = useCallback(async () => {
    if (!CONTRACT_ID) return { goal: 0, raised: 0, active: false, creator: "" };
    try {
      const contract = new StellarSdk.Contract(CONTRACT_ID);
      // Create a dummy account for reading state
      const dummyPublicKey = StellarSdk.Keypair.random().publicKey();
      const sourceAccount = new StellarSdk.Account(dummyPublicKey, "0");
      let tx = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: "100",
        networkPassphrase: NETWORK_PASSPHRASE,
      })
      .addOperation(contract.call("get_campaign"))
      .setTimeout(30)
      .build();

      const simulated = await server.simulateTransaction(tx);
      if (StellarSdk.rpc.Api.isSimulationSuccess(simulated)) {
        const result = simulated.result?.retval;
        if (result) {
          const val = StellarSdk.scValToNative(result);
          return { goal: Number(val.goal), raised: Number(val.total_raised) / 1e7, active: val.active, creator: val.creator ? val.creator.toString() : "" };
        }
      }
      return { goal: 0, raised: 0, active: false, creator: "" };
    } catch (e) {
      console.error("Failed to fetch campaign data", e);
      return { goal: 0, raised: 0, active: false, creator: "" };
    }
  }, [server]);

  const donate = async (amount: string) => {
    if (!kit || !address) {
      toast.error("Wallet not installed or connected");
      throw new Error("Wallet not connected");
    }
    if (!CONTRACT_ID) {
      toast.error("Contract not deployed yet.");
      throw new Error("Contract not deployed");
    }
    
    // Balance Validation
    try {
      const horizonServer = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");
      const account = await horizonServer.loadAccount(address);
      const xlmBalance = account.balances.find((b: any) => b.asset_type === 'native');
      if (!xlmBalance || parseFloat(xlmBalance.balance) < parseFloat(amount)) {
        toast.error("Insufficient Balance");
        throw new Error("Insufficient Balance");
      }
    } catch (e: any) {
      if (e.message === "Insufficient Balance") throw e;
      console.warn("Could not fetch balance, proceeding anyway...");
    }
    
    try {
      const contract = new StellarSdk.Contract(CONTRACT_ID);
      const amountInStroops = Math.floor(parseFloat(amount) * 1e7);
      
      let sourceAccount;
      try {
        sourceAccount = await server.getAccount(address);
      } catch (e) {
        toast.error("Insufficient balance or unfunded account on Testnet.");
        throw new Error("Account not found");
      }
      
      let tx = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: "10000",
        networkPassphrase: NETWORK_PASSPHRASE,
      })
      .addOperation(
        contract.call(
          "donate",
          new StellarSdk.Address(address).toScVal(),
          new StellarSdk.Address(XLM_CONTRACT_ID).toScVal(),
          StellarSdk.nativeToScVal(amountInStroops, { type: "i128" })
        )
      )
      .setTimeout(0)
      .build();

      const simulated = await server.simulateTransaction(tx);
      
      if (!StellarSdk.rpc.Api.isSimulationSuccess(simulated)) {
        toast.error("Simulation failed. Insufficient funds or invalid state?");
        throw new Error("Transaction simulation failed");
      }

      let assembledTx = StellarSdk.rpc.assembleTransaction(tx as any, simulated) as any;
      if (typeof assembledTx.build === 'function') assembledTx = assembledTx.build();
      
      let signedXdr;
      try {
         signedXdr = await kit.signTransaction(assembledTx.toXDR(), { networkPassphrase: NETWORK_PASSPHRASE });
      } catch (e: any) {
         toast.error("User rejected the transaction");
         throw new Error("User declined");
      }
      
      const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedXdr.signedTxXdr, NETWORK_PASSPHRASE) as StellarSdk.Transaction;
      const response = await server.sendTransaction(signedTx);
      
      if (response.status === "ERROR") {
        console.error("Transaction failed on submission.");
        console.error("Soroban RPC SendTransactionResponse:", JSON.stringify(response, null, 2));
        if ((response as any).errorResult) {
          try {
            console.error("Parsed Error Result:", JSON.stringify((response as any).errorResult, null, 2));
          } catch (e) {
            console.error("Could not parse errorResult", e);
          }
        }
        toast.error("Transaction failed on submission.");
        throw new Error("Transaction failed on submission.");
      }
      
      let statusResponse;
      let retries = 0;
      while (retries < 15) {
        try {
          statusResponse = await server.getTransaction(response.hash);
        } catch (xdrErr: any) {
          // "Bad union switch: N" means the local stellar-base XDR definition
          // doesn't recognise this TransactionMeta variant yet (Protocol 22+).
          // Treat it as NOT_FOUND and keep polling — the vite dedupe alias
          // should prevent this, but we guard defensively.
          const msg: string = xdrErr?.message ?? "";
          if (msg.includes("Bad union switch")) {
            await new Promise(r => setTimeout(r, 2000));
            retries++;
            continue;
          }
          throw xdrErr;
        }
        if (statusResponse.status !== StellarSdk.rpc.Api.GetTransactionStatus.NOT_FOUND) {
          break;
        }
        await new Promise(r => setTimeout(r, 2000));
        retries++;
      }

      if (statusResponse?.status === StellarSdk.rpc.Api.GetTransactionStatus.SUCCESS) {
        return response.hash;
      } else if (!statusResponse) {
        // Polling exhausted without a successful parse — transaction was
        // submitted and likely landed (contract state updates confirm this).
        // Return the hash optimistically rather than showing "Failed".
        toast.success("Transaction submitted. Refresh to see updated state.");
        return response.hash;
      } else {
        toast.error(`Transaction failed on ledger: ${statusResponse?.status}`);
        throw new Error(`Transaction failed: ${statusResponse?.status}`);
      }
      
    } catch (e: any) {
      console.error(e);
      throw e;
    }
  };

  const getDonorCount = useCallback(async () => {
    if (!CONTRACT_ID) return 0;
    try {
      const latest = await server.getLatestLedger();
      const startLedger = Math.max(1, latest.sequence - 2000);
      const response = await server.getEvents({
        startLedger,
        filters: [{
          type: "contract" as const,
          contractIds: [CONTRACT_ID],
          topics: [["*", "*"]]
        }]
      });
      const uniqueDonors = new Set<string>();
      for (const ev of (response.events || [])) {
        if (!(ev as any).inSuccessfulContractCall) continue;
        try {
          if (ev.topic && ev.topic[1]) {
            uniqueDonors.add(StellarSdk.scValToNative(ev.topic[1]));
          }
        } catch { /* skip unparseable */ }
      }
      return uniqueDonors.size;
    } catch {
      return 0;
    }
  }, [server]);

  const getTotalDonations = useCallback(async () => {
    if (!CONTRACT_ID) return 0;
    try {
      const latest = await server.getLatestLedger();
      const startLedger = Math.max(1, latest.sequence - 2000);
      const response = await server.getEvents({
        startLedger,
        filters: [{
          type: "contract" as const,
          contractIds: [CONTRACT_ID],
          topics: [["*", "*"]]
        }]
      });
      let totalDonations = 0;
      for (const ev of (response.events || [])) {
        if ((ev as any).inSuccessfulContractCall) {
          totalDonations++;
        }
      }
      return totalDonations;
    } catch {
      return 0;
    }
  }, [server]);

  return { donate, getCampaign, getDonorCount, getTotalDonations, server };
};

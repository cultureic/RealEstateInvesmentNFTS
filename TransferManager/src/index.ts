import { IDL, query, update, caller, Principal, call } from 'azle';
import {
    ic,
} from 'azle/experimental'; import {
    createStacksPrivateKey,
    makeRandomPrivKey,
    getPublicKey,
    getAddressFromPrivateKey,
    TransactionVersion,
    privateKeyToString,
    AnchorMode,
    makeContractDeploy,
    broadcastTransaction,
    makeContractCall,
    callReadOnlyFunction,
    bufferCVFromString,
    principalCV,
    uintCV,
    ClarityAbi,
    Pc,
    Cl
} from "@stacks/transactions";
import { StacksTestnet, StacksMainnet } from "@stacks/network";


let abi: ClarityAbi = JSON.parse(`{"functions":[{"name":"mint","access":"public","args":[{"name":"recipient","type":"principal"}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}},{"name":"transfer","access":"public","args":[{"name":"token-id","type":"uint128"},{"name":"sender","type":"principal"},{"name":"recipient","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}},{"name":"get-last-token-id","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}},{"name":"get-owner","access":"read_only","args":[{"name":"token-id","type":"uint128"}],"outputs":{"type":{"response":{"ok":{"optional":"principal"},"error":"none"}}}},{"name":"get-token-uri","access":"read_only","args":[{"name":"token-id","type":"uint128"}],"outputs":{"type":{"response":{"ok":{"optional":{"string-ascii":{"length":80}}},"error":"none"}}}}],"variables":[{"name":"COLLECTION_LIMIT","type":"uint128","access":"constant"},{"name":"CONTRACT_OWNER","type":"principal","access":"constant"},{"name":"ERR_NOT_TOKEN_OWNER","type":{"response":{"ok":"none","error":"uint128"}},"access":"constant"},{"name":"ERR_OWNER_ONLY","type":{"response":{"ok":"none","error":"uint128"}},"access":"constant"},{"name":"ERR_SOLD_OUT","type":{"response":{"ok":"none","error":"uint128"}},"access":"constant"},{"name":"base-uri","type":{"string-ascii":{"length":80}},"access":"variable"},{"name":"last-token-id","type":"uint128","access":"variable"}],"maps":[],"fungible_tokens":[],"non_fungible_tokens":[{"name":"NFT-Property-1","type":"uint128"}],"epoch":"Epoch30","clarity_version":"Clarity2"}`)

function stringifyWithBigInt(obj: any) {
    return JSON.stringify(obj, (key, value) =>
        typeof value === "bigint" ? `${value}n` : value
    );
}


export default class {
    message2: any;

    @query([], IDL.Text)
    getMessage2(): any {
        return this.message2;
    }

    @query([IDL.Record({
        'response': IDL.Record({
            "status": IDL.Nat,
            "headers": IDL.Vec(IDL.Record({ "name": IDL.Text, "value": IDL.Text })),
            "body": IDL.Vec(IDL.Nat8)
        }),
        "context": IDL.Vec(IDL.Nat8)
    })], IDL.Record({
        "status": IDL.Nat,
        "headers": IDL.Vec(IDL.Record({ "name": IDL.Text, "value": IDL.Text })),
        "body": IDL.Vec(IDL.Nat8)
    }))
    transform(args: any): any {
        return {
            ...args.response,
            headers: []
        };
    }

    //zqx6f-7ogpk-ruqqb-wcraj-jfjdu-h5vzx-nztqy-2b7mq-evo4t-ftrys-fae test principal
    // @update([], IDL.Vec(IDL.Nat64))
    // async checkIfhasNFT(): Promise<[bigint]> {
    //     let response = await call("djcrm-lqaaa-aaaaj-azulq-cai", "checkifHasNFT", {
    //         paramIdlTypes: [IDL.Text, IDL.Principal],
    //         returnIdlType: IDL.Vec(IDL.Nat),
    //         args: [
    //             "ST1SEDGTMNQ34Y1N99D1V0N63MSK33KZCEXHTQTD.glacier_av_6282_las_vegas",
    //             Principal.fromText("22hkz-me2fa-xv2zu-fcmyh-p3jl4-rnbsb-oibl6-ewdet-3wwhk-xzjao-7ae")
    //         ]
    //     })
    //     this.message2 = await response[1];
    //     return response;
    // }




    @update([IDL.Principal, IDL.Text], IDL.Text)
    async transFerNFTtoPrincipal(to: Principal, contract: Text): Promise<any> {
        let response = await call("djcrm-lqaaa-aaaaj-azulq-cai", "checkifHasNFT", {
            paramIdlTypes: [IDL.Text, IDL.Principal],
            returnIdlType: IDL.Vec(IDL.Nat),
            args: [
                contract,
                caller()
            ]
        })
        if (response) {
            let fromPublicArray = await call("djcrm-lqaaa-aaaaj-azulq-cai", "canister_and_caller_pub_key_signer", {
                paramIdlTypes: [IDL.Principal],
                returnIdlType: IDL.Vec(IDL.Nat8),
                args: [caller()]
            })
            fromPublicArray[32] = 1;
            let fromHex = Buffer.from(fromPublicArray).toString("hex");
            const fromStackAddress = getAddressFromPrivateKey(
                fromHex,
                TransactionVersion.Testnet // remove for Mainnet addresses
            );
            let toPublicArray = await call("djcrm-lqaaa-aaaaj-azulq-cai", "canister_and_caller_pub_key_signer", {
                paramIdlTypes: [IDL.Principal],
                returnIdlType: IDL.Vec(IDL.Nat8),
                args: [to]
            })

            toPublicArray[32] = 1;
            let toHex = Buffer.from(toPublicArray).toString("hex");
            const toStackAddress = getAddressFromPrivateKey(
                toHex,
                TransactionVersion.Testnet // remove for Mainnet addresses
            );
            //@ts-ignore
            let contractSplit = contract.split(".");
            const network = new StacksTestnet();
            ic.setOutgoingHttpOptions({ cycles: 30_849_862_900n, transformMethodName: "transform" });
            const postCondition = Pc.principal(fromStackAddress).willSendAsset()
                //@ts-ignore
                .nft(`${contract}::${contractSplit[1]}`, Cl.uint(Number(response[0]) + 1));
            const tx2Options = {
                contractAddress: contractSplit[0],
                contractName: contractSplit[1],
                functionName: "transfer",
                functionArgs: [uintCV(Number(response[0]) + 1), principalCV(fromStackAddress), principalCV(toStackAddress)],
                senderKey: fromHex,
                validateWithAbi: abi,
                postConditions: [postCondition],
                anchorMode: AnchorMode.Any,
                network
            };
            const transaction2 = await makeContractCall(tx2Options);
            // return stringifyWithBigInt(tx2Options);
            const broadcastResponse = await broadcastTransaction(transaction2, network);
            this.message2 = stringifyWithBigInt(broadcastResponse);
            if (broadcastResponse.error) {
                return broadcastResponse.error;
            }
            const txId = broadcastResponse.txid;

            return txId;

        }
        return "finish outside the if";
    };


    @update([], IDL.Vec(IDL.Nat8))
    async createSTXWallet(): Promise<any> {
        let response = await call("djcrm-lqaaa-aaaaj-azulq-cai", "canister_and_caller_pub_key_signer", {
            paramIdlTypes: [IDL.Principal],
            returnIdlType: IDL.Vec(IDL.Nat8),
            args: [caller()]
        })
        this.message2 = response;
        return response;
    };




    // @update([], IDL.Nat64)
    // async getBalance(): Promise<bigint> {
    //     return await call("glpyt-hqaaa-aaaap-ahsca-cai", 'icrc1_balance_of', {
    //         paramIdlTypes: [IDL.Record({
    //             'owner': IDL.Principal,
    //             'subaccount': IDL.Opt(IDL.Vec(IDL.Nat8)),
    //         })],
    //         returnIdlType: IDL.Nat,
    //         args: [
    //             {
    //                 owner: id(),
    //                 subaccount: []
    //             }
    //         ]
    //     });
    // }
}




import Result "mo:base/Result";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Principal "mo:base/Principal";
import Error "mo:base/Error";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Prelude "mo:base/Prelude";
import Nat32 "mo:base/Nat32";
import Nat64 "mo:base/Nat64";
import Array "mo:base/Array";
import Sha256 "mo:sha2/Sha256";
import TrieMap "mo:base/TrieMap";
import Random "mo:base/Random";

//gives error in vscode but should still work

// import Types "./types";
// import {
//   createInvoice;
//   toAccount;
//   toSubaccount;
//   hashNat;
// } "utils";
import Blob "mo:base/Blob";
import Bool "mo:base/Bool";
import Buffer "mo:base/Buffer";

import IC "./IC";
import Hex "./Hex";

actor STXSigner {

    type IC = IC.Self;

    public type Mint = {
        ids : [Nat];
        ownerStx : Text;
    };

    public type Mints = {
        mints : TrieMap.TrieMap<Principal,Mint>;
    };

    public type Property = {
        id : Nat;
        privateKey : ?[Nat8];
        contract : ?Text;
        address : Text;
        valueBTC : Nat;
        picture : [Nat8];
        description : Text;
        rentValueBTC : Nat;
        status : Text;
        owner : Principal;
        stxWallet : ?Text;
    };

    public type PropertyRequest = {
        privateKey : [Nat8];
        contract : ?Text;
        address : Text;
        valueBTC : Nat;
        picture : [Nat8];
        description : Text;
        rentValueBTC : Nat;
        status : Text;
    };

    public type PropertyResponse = {
        picture : [Nat8];
        valueBTC : Nat;
        rentValueBTC : Nat;
        address : Text;
        stxWallet : ?Text;
        description : Text;
        contract : ?Text;
    };
    let registeredMints = TrieMap.TrieMap<Text, Mints>(Text.equal, Text.hash);

    let registeredProperties = TrieMap.TrieMap<Text, Property>(Text.equal, Text.hash);

    let ic : IC = actor ("aaaaa-aa");

    public shared (msg) func createProperty(newPropertyRequest : PropertyRequest) : async Nat {

        let newId = registeredProperties.size();
        let newProperty : Property = {
            id = newId;
            privateKey = ?newPropertyRequest.privateKey;
            contract = newPropertyRequest.contract;
            address = newPropertyRequest.address;
            valueBTC = newPropertyRequest.valueBTC;
            picture = newPropertyRequest.picture;
            description = newPropertyRequest.description;
            rentValueBTC = newPropertyRequest.rentValueBTC;
            status = newPropertyRequest.status;
            owner = msg.caller;
            stxWallet = null;
        };
        registeredProperties.put(Nat.toText(newId), newProperty);
        return newId;
    };

    public shared (msg) func createNewMint(contract : Text, stxOwner : Text, id : Nat) : async {
        #Ok : Text;
        #Err : Text;
    } {
        switch(registeredMints.get(contract)){
            case(?mints){
                    switch(mints.mints.get(msg.caller)){
                        case(?mint){
                            let newIds:[Nat] = [id];
                            let newIdsForMint = Array.append(mint.ids,newIds);
                            let newMint:Mint = {ownerStx=mint.ownerStx;ids=newIdsForMint;};
                            mints.mints.put(msg.caller,newMint);
                            return #Ok("new mint created");
                        };
                        case(null){
                            return #Err("this should never happen");
                        };
                        
                    };
            };
           case (null){
            let newTrieMapsForContract = TrieMap.TrieMap<Principal,Mint>(Principal.equal,Principal.hash);
            newTrieMapsForContract.put(msg.caller,{ids=[id];ownerStx=stxOwner;});
            registeredMints.put(contract,{mints=newTrieMapsForContract});
            return #Ok("new trie map create for contract");
           };
        };
        return #Ok("hi");
    };


    public shared (msg) func checkifHasNFT(contract:Text,owner:Principal):async[Nat]{
        switch(registeredMints.get(contract)){
            case(?contract){
                switch(contract.mints.get(owner)){
                    case(?owned){
                            return owned.ids;
                    };
                    case(null){
                        return[0];
                    };
                }
            };
            case(null){
                return[0];
            };

        }
    };

    public shared (msg) func crearPropertyWallet(id : Nat) : async {
        #Ok : Blob;
        #Err : Text;
    } {
        try {
            let caller = Principal.toBlob(msg.caller);
            let porpertyHash = await Random.blob();
            let canisterBlob = Principal.toBlob(Principal.fromActor(STXSigner));
            let canisterDerivationPassword = Blob.fromArray([12, 1, 34, 43, 33]);
            let { public_key } = await ic.ecdsa_public_key({
                canister_id = null;
                derivation_path = [caller, canisterBlob, canisterDerivationPassword, porpertyHash];
                key_id = { curve = #secp256k1; name = "key_1" };
            });
            switch (registeredProperties.get(Nat.toText(id))) {
                case (?property) {
                    if (msg.caller == property.owner) {
                        let updateProperty : Property = {
                            id = id;
                            privateKey = ?Blob.toArray(public_key);
                            contract = property.contract;
                            address = property.address;
                            valueBTC = property.valueBTC;
                            rentValueBTC = property.rentValueBTC;
                            status = property.status;
                            owner = property.owner;
                            picture = property.picture;
                            description = property.description;
                            stxWallet = property.stxWallet;
                        };
                        registeredProperties.put(Nat.toText(id), updateProperty);
                        return #Ok(public_key);
                    } else {
                        return #Err("not the property owwneer");
                    };
                };
                case (null) {
                    return #Err("property doesnt exist");
                };
            };
        } catch (err) {
            #Err(Error.message(err));
        };
    };

    public shared (msg) func setStxPropertyWallet(id : Nat, wallet : Text) : async {
        #Ok : Text;
        #Err : Text;
    } {

        switch (registeredProperties.get(Nat.toText(id))) {
            case (?property) {
                if (msg.caller == property.owner) {
                    let updateProperty : Property = {
                        id = id;
                        privateKey = property.privateKey;
                        contract = property.contract;
                        address = property.address;
                        valueBTC = property.valueBTC;
                        rentValueBTC = property.rentValueBTC;
                        status = property.status;
                        owner = property.owner;
                        picture = property.picture;
                        description = property.description;
                        stxWallet = ?wallet;
                    };
                    registeredProperties.put(Nat.toText(id), updateProperty);
                    return #Ok(wallet);
                } else {
                    return #Err("not the property owwneer");
                };
            };
            case (null) {
                return #Err("property doesnt exist");
            };
        };
    };

    public shared (msg) func propertyDeployed(id : Nat, contract : Text) : async {
        #Ok : Text;
        #Err : Text;
    } {

        switch (registeredProperties.get(Nat.toText(id))) {
            case (?property) {
                if (msg.caller == property.owner) {
                    let updateProperty : Property = {
                        id = id;
                        privateKey = property.privateKey;
                        contract = ?contract;
                        address = property.address;
                        valueBTC = property.valueBTC;
                        rentValueBTC = property.rentValueBTC;
                        status = "deployed";
                        owner = property.owner;
                        picture = property.picture;
                        description = property.description;
                        stxWallet = property.stxWallet;
                    };
                    registeredProperties.put(Nat.toText(id), updateProperty);
                    return #Ok(contract);
                } else {
                    return #Err("not the property owwneer");
                };
            };
            case (null) {
                return #Err("property doesnt exist");
            };
        };
    };

    public shared (msg) func canister_and_caller_pub_key() : async {
        #Ok : { public_key : Blob };
        #Err : Text;
    } {
        let caller = Principal.toBlob(msg.caller);
        let canisterBlob = Principal.toBlob(Principal.fromActor(STXSigner));
        let canisterDerivationPassword = Blob.fromArray([12, 1, 34, 43, 33]);
        try {
            let { public_key } = await ic.ecdsa_public_key({
                canister_id = null;
                derivation_path = [caller, canisterBlob, canisterDerivationPassword];
                key_id = { curve = #secp256k1; name = "key_1" };
            });

            #Ok({ public_key = public_key });
        } catch (err) {
            #Err(Error.message(err));
        };
    };

    public shared (msg) func getUserProperties() : async [Property] {
        let propertyBuffer : Buffer.Buffer<Property> = Buffer.Buffer<Property>(0);
        for (property in registeredProperties.vals()) {
            if (property.owner == msg.caller) {
                propertyBuffer.add(property);
            };
        };
        return Buffer.toArray(propertyBuffer);
    };

    public shared (msg) func getPropertyNFTData(contract : Text) : async [PropertyResponse] {
        let propertyBuffer : Buffer.Buffer<PropertyResponse> = Buffer.Buffer<PropertyResponse>(0);
        label eachProperty for (property in registeredProperties.vals()) {
            let ?contractProperty = property.contract else continue eachProperty;

            if (Text.equal(contractProperty, contract)) {
                let propertyResponse : PropertyResponse = {
                    address = property.address;
                    contract = property.contract;
                    picture = property.picture;
                    rentValueBTC = property.rentValueBTC;
                    stxWallet = property.stxWallet;
                    valueBTC = property.valueBTC;
                    description = property.description;
                };
                propertyBuffer.add(propertyResponse);
            };

        };
        return Buffer.toArray(propertyBuffer);
    };

    //   type CkMinter = CkMinter.CkMinter;

    //   stable var stableItems : [(Nat, Types.Item)] = [];
    //   stable var stableProfile : [(Principal, Types.Profile)] = [];
    //   stable var stableBtcAddress : [(Principal, Text)] = [];

    //   let itemStore = HashMap.fromIter<Nat, Types.Item>(Iter.fromArray(stableItems), stableItems.size(), Nat.equal, hashNat);
    //   let profileStore = HashMap.fromIter<Principal, Types.Profile>(Iter.fromArray(stableProfile), stableProfile.size(), Principal.equal, Principal.hash);
    //   let btcAddressStore = HashMap.fromIter<Principal, Text>(Iter.fromArray(stableBtcAddress), stableProfile.size(), Principal.equal, Principal.hash);

    //   // Upgrade canister
    //   system func preupgrade() {
    //     stableItems := Iter.toArray(itemStore.entries());
    //     stableProfile := Iter.toArray(profileStore.entries());
    //   };

    //   system func postupgrade() {
    //     stableItems := [];
    //     stableProfile := [];
    //   };

    //   public query func bitFabricCanister() : async Text {
    //     return Principal.toText(Principal.fromActor(CkPayment));
    //   };

    //   public query ({ caller }) func whoamisub() : async Types.Subaccount {
    //     return toSubaccount(caller);
    //   };

    //   public shared (msg) func mintBTC() : async Result.Result<Text, Text> {
    //     switch (btcAddressStore.get(msg.caller)) {
    //       case null {
    //         let ckMinter = actor ("mqygn-kiaaa-aaaar-qaadq-cai") : CkMinter;
    //         let caller = msg.caller;
    //         try {
    //           let address : Text = await ckMinter.get_btc_address(
    //             toAccount({ caller; canister = Principal.fromActor(CkPayment) })
    //           );
    //           btcAddressStore.put(msg.caller, address);
    //           return #ok address;
    //         } catch (e) {
    //           return #err "failed to BTC grab address";
    //         };
    //       };
    //       case (?found) {
    //         return #ok found;
    //       };
    //     };

    //   };

    //   public shared({caller}) func withdraw(): async Result.Result<Nat,Types.TransferError>{
    //   let amount = await CkBtcLedger.icrc1_balance_of({owner=Principal.fromActor(CkPayment);subaccount=?toSubaccount(caller)});
    //   let realAmout = amount-10;
    //    let request:Types.TransferArg = {
    //                     amount = realAmout;
    //                     fee = null;
    //                     memo = null;
    //                     from_subaccount = ?toSubaccount(caller);
    //                     to = {owner=caller;subaccount=null};
    //                     created_at_time = null;
    //                 };
    //                 let response:Types.TransferResult = await CkBtcLedger.icrc1_transfer(request);
    //                 switch(response) {
    //                   case(#Ok(msg)) {

    //                     return #ok(msg);
    //                   };
    //                   case(#Err(msg)) {
    //                     return #err(msg);
    //                   };
    //                 };
    // };

    //   public shared (msg) func whoami() : async Text {
    //     return Principal.toText(msg.caller);
    //   };

    //   public query (msg) func canCreateStore() : async Bool {
    //     if (null != profileStore.get(msg.caller)) return false;
    //     return true;
    //   };

    //   public shared (msg) func addNewItem(newItem : Types.NewItemRequest) : async Result.Result<Nat, Text> {
    //     if (null == profileStore.get(msg.caller)) return #err("You are not a merchant");
    //     let newId = itemStore.size();

    //     let itemToAdd : Types.Item = {
    //       id = newId;
    //       name = newItem.name;
    //       available = newItem.available;
    //       cost = newItem.cost;
    //       category = newItem.category;
    //       merchant = msg.caller;
    //       wallet = null;
    //     };

    //     itemStore.put(newId, itemToAdd);
    //     return #ok(newId);
    //   };

    //   public shared (msg) func addNewProfile(newProfile : Types.Profile) : async Result.Result<Types.Profile, Text> {
    //     if (null != profileStore.get(msg.caller)) return #err("You already registered");
    //     let response = await CkBtcLedger.icrc1_balance_of({
    //       owner = Principal.fromActor(CkPayment);
    //       subaccount = ?toSubaccount(msg.caller);
    //     });

    //     if (response >= 26320) {
    //       let profileToAdd : Types.Profile = {
    //         name = newProfile.name;
    //         profilePicture = newProfile.profilePicture;
    //         description = newProfile.description;
    //       };

    //       profileStore.put(msg.caller, profileToAdd);
    //       return #ok(profileToAdd);
    //     };

    //     return #err "Not enought balance to create the store";
    //   };

    //   public shared (msg) func getItem(id : Nat) : async Result.Result<Types.Item, Text> {
    //     let errorMsg = "item does not exist";
    //     // if (id >= itemStore.size()) {
    //     //   return #err(errorMsg);
    //     // };
    //     switch (itemStore.get(id)) {
    //       case null { return #err(errorMsg) };
    //       case (?found) {
    //         return #ok(found);
    //       };
    //     };
    //   };

    //   public query (msg) func getProfileItems(principal:Principal): async [Types.Item]{
    //     let profileItems = Buffer.Buffer<Types.Item>(0);
    //       for(value in itemStore.vals()){
    //         if(value.merchant == principal){
    //           profileItems.add(value)
    //         };
    //       };
    //       return Buffer.toArray(profileItems);
    //   };

    //   public shared (msg) func getProfile(p : Principal) : async Result.Result<Types.Profile, Text> {
    //     let errorMsg = "Invoice does not exist";
    //     switch (profileStore.get(p)) {
    //       case null { return #err(errorMsg) };
    //       case (?found) {
    //         return #ok(found);
    //       };
    //     };
    //   };

    //   // public shared (msg) func deleteItem(id:Nat) : async Result.Result<(Text),Text>{
    //   //      let errorMsg = "Item does not exist";
    //   //   switch (itemStore.delete(id))) {
    //   //     case (()) {
    //   //       return #ok("item has been deleted");
    //   //     };
    //   //   };
    //   // };

    //   //   public shared (msg) func deleteProfile(principal:Principal) : async Result.Result<(Text),Text>{
    //   //      let errorMsg = "Item does not exist";
    //   //   switch (profileStore.delete(principal)) {
    //   //     case (()) {
    //   //       return #ok("item has been deleted");
    //   //     };
    //   //   };
    //   // };

    //   public shared (msg) func updateProfile(profile : Types.Profile) : async Result.Result<(Types.Profile), Text> {
    //     switch (profileStore.get(msg.caller)) {
    //       case null {
    //         return #err("Profile not found");
    //       };
    //       case (?found) {
    //         let imgBlob : ?Blob = profile.profilePicture;
    //         let newProfile : Types.Profile = {
    //           name = profile.name;
    //           profilePicture = imgBlob;
    //           description = profile.name;
    //         };
    //         profileStore.put(msg.caller, newProfile);
    //         return #ok newProfile;
    //       };
    //     };
    //   };

    //   public shared (msg) func updateItem(id : Nat, newItem : Types.Item) : async Result.Result<Types.Item, Text> {
    //     let errorMsg = "item does not exist";
    //     if (id >= itemStore.size()) {
    //       return #err(errorMsg);
    //     };
    //     switch (itemStore.get(id)) {
    //       case null { return #err errorMsg };
    //       case (?found) {
    //         if (msg.caller != found.merchant) return #err("You are not the merchant of this item");
    //         let itemToUpdate : Types.Item = {
    //           id = found.id;
    //           name = newItem.name;
    //           cost = newItem.cost;
    //           available = newItem.available;
    //           category = newItem.category;
    //           merchant = found.merchant;
    //           wallet = newItem.wallet;
    //         };
    //         itemStore.put(id, itemToUpdate);
    //         return #ok itemToUpdate;
    //       };
    //     };
    //   };

    //   //PAYMENTS LOGIC
    //   //ckBTC icrc services
    //   // icrc1_name : () -> (text) query;
    //   // icrc1_symbol : () -> (text) query;
    //   // icrc1_decimals : () -> (nat8) query;
    //   // icrc1_metadata : () -> (vec record { text; MetadataValue }) query;
    //   // icrc1_total_supply : () -> (Tokens) query;
    //   // icrc1_fee : () -> (Tokens) query;
    //   // icrc1_minting_account : () -> (opt Account) query;
    //   // icrc1_balance_of : (Account) -> (Tokens) query;
    //   // icrc1_transfer : (TransferArg) -> (TransferResult);
    //   // icrc1_supported_standards : () -> (vec record { name : text; url : text }) query;
    //   // get_transactions : (GetTransactionsRequest) -> (GetTransactionsResponse) query;
    //   // get_blocks : (GetBlocksArgs) -> (GetBlocksResponse) query;
    //   // get_data_certificate : () -> (DataCertificate) query;

    //   public shared ({ caller }) func getInvoice(itemId : Nat) : async Result.Result<Types.Invoice, Text> {
    //     let ?item = itemStore.get(itemId) else return #err("Can't find item");
    //     if (false == item.available) return #err("Item isn't available");

    //     //cost created + 10sat for eventual transfer to merchant, this could also be a merchant specified value
    //     return #ok(
    //       createInvoice(
    //         toAccount({ caller; canister = Principal.fromActor(CkPayment) }),
    //         item.cost + 10,
    //         itemId,
    //         item.merchant,
    //       )
    //     );
    //   };

    //   //TODO: this function will not work bcs icrc1_transfer will use canister as msg.caller instead of our user/caller
    //   public shared ({ caller }) func payInvoice(invoice : Types.Invoice) : async Result.Result<(), Text> {
    //     try {
    //       let transferResult = await CkBtcLedger.icrc1_transfer(
    //         {
    //           amount = invoice.amount;
    //           from_subaccount = null;
    //           created_at_time = null;
    //           fee = ?10;
    //           memo = null;
    //           to = invoice.to;
    //         }
    //       );

    //       switch (transferResult) {
    //         case (#Err(transferError)) {
    //           return #err("Couldn't transfer funds to destination account:\n" # debug_show (transferError));
    //         };
    //         case (_) {};
    //       };
    //     } catch (error : Error) {
    //       return #err("Reject message: " # Error.message(error));
    //     };
    //     #ok();
    //   };

    //   public shared ({ caller }) func getBalance() : async Nat {
    //     let balance = await CkBtcLedger.icrc1_balance_of(
    //       toAccount({ caller; canister = Principal.fromActor(CkPayment) })
    //     );
    //     return balance;
    //   };

    //   public shared ({ caller }) func buyItem(itemId : Nat) : async Result.Result<Text, Text> {
    //     let ?item = itemStore.get(itemId) else return #err("Can't find item");
    //     if (false == item.available) return #err("Item isn't available");
    //     let merchant = item.merchant;
    //     //TODO: check if amount of product is not 0
    //     let toMerchant = toAccount({
    //       caller = merchant;
    //       canister = Principal.fromActor(CkPayment);
    //     });

    //     //check ckBTC balance of the callers dedicated account
    //     let balance = await CkBtcLedger.icrc1_balance_of(
    //       toAccount({ caller; canister = Principal.fromActor(CkPayment) })
    //     );

    //     if (balance < item.cost + 10) {
    //       return #err("Not enough funds available in the Account. Make sure you send at least " # Nat.toText(item.cost + 15) # " ckSats.");
    //     };

    //     try {
    //       // if enough funds were sent, move them to the merchant chosen account/sub
    //       //Pawbets example merchant would create items with item.wallet value as the gameId from PawBets
    //       //if merchant wants payment into its main account it would give value 'null'
    //       let transferResult = await CkBtcLedger.icrc1_transfer(
    //         {
    //           amount = balance - 10;
    //           from_subaccount = ?toSubaccount(caller);
    //           created_at_time = null;
    //           fee = ?10;
    //           memo = null;
    //           to = toMerchant;
    //         }
    //       );

    //       switch (transferResult) {
    //         case (#Err(transferError)) {
    //           return #err("Couldn't transfer funds to destination account:\n" # debug_show (transferError));
    //         };
    //         case (_) {};
    //       };
    //     } catch (error : Error) {
    //       return #err("Reject message: " # Error.message(error));
    //     };
    //     //TODO: if needed make amount of product go down

    //     return #ok("Bought product!");
    //   };

};

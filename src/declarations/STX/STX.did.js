export const idlFactory = ({ IDL }) => {
  const PropertyRequest = IDL.Record({
    'status' : IDL.Text,
    'rentValueBTC' : IDL.Nat,
    'contract' : IDL.Opt(IDL.Text),
    'description' : IDL.Text,
    'picture' : IDL.Vec(IDL.Nat8),
    'privateKey' : IDL.Vec(IDL.Nat8),
    'address' : IDL.Text,
    'valueBTC' : IDL.Nat,
  });
  const PropertyResponse = IDL.Record({
    'stxWallet' : IDL.Opt(IDL.Text),
    'rentValueBTC' : IDL.Nat,
    'contract' : IDL.Opt(IDL.Text),
    'description' : IDL.Text,
    'picture' : IDL.Vec(IDL.Nat8),
    'address' : IDL.Text,
    'valueBTC' : IDL.Nat,
  });
  const Property = IDL.Record({
    'id' : IDL.Nat,
    'status' : IDL.Text,
    'stxWallet' : IDL.Opt(IDL.Text),
    'rentValueBTC' : IDL.Nat,
    'ckBTCWallet' : IDL.Opt(IDL.Text),
    'contract' : IDL.Opt(IDL.Text),
    'owner' : IDL.Principal,
    'description' : IDL.Text,
    'picture' : IDL.Vec(IDL.Nat8),
    'privateKey' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'address' : IDL.Text,
    'valueBTC' : IDL.Nat,
  });
  return IDL.Service({
    'canister_and_caller_pub_key' : IDL.Func(
        [],
        [
          IDL.Variant({
            'Ok' : IDL.Record({ 'public_key' : IDL.Vec(IDL.Nat8) }),
            'Err' : IDL.Text,
          }),
        ],
        [],
      ),
    'canister_and_caller_pub_key_signer' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(IDL.Nat8)],
        [],
      ),
    'checkifHasNFT' : IDL.Func(
        [IDL.Text, IDL.Principal],
        [IDL.Vec(IDL.Nat)],
        [],
      ),
    'crearPropertyWallet' : IDL.Func(
        [IDL.Nat],
        [IDL.Variant({ 'Ok' : IDL.Vec(IDL.Nat8), 'Err' : IDL.Text })],
        [],
      ),
    'createNewMint' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Nat],
        [IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text })],
        [],
      ),
    'createProperty' : IDL.Func([PropertyRequest], [IDL.Nat], []),
    'getPropertyNFTData' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(PropertyResponse)],
        [],
      ),
    'getUserProperties' : IDL.Func([], [IDL.Vec(Property)], []),
    'propertyDeployed' : IDL.Func(
        [IDL.Nat, IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text })],
        [],
      ),
    'setStxPropertyWallet' : IDL.Func(
        [IDL.Nat, IDL.Text, IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text })],
        [],
      ),
    'transferMints' : IDL.Func(
        [IDL.Text, IDL.Principal, IDL.Principal, IDL.Nat],
        [IDL.Vec(IDL.Nat)],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };

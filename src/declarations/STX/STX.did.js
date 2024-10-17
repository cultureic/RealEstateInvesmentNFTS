export const idlFactory = ({ IDL }) => {
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
    'public_key' : IDL.Func(
        [],
        [
          IDL.Variant({
            'Ok' : IDL.Record({ 'public_key' : IDL.Text }),
            'Err' : IDL.Text,
          }),
        ],
        [],
      ),
    'sign' : IDL.Func(
        [IDL.Vec(IDL.Nat8)],
        [IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text })],
        [],
      ),
    'signByCallerAndCanister' : IDL.Func(
        [IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Vec(IDL.Nat8), 'Err' : IDL.Text })],
        [],
      ),
    'signOG' : IDL.Func(
        [IDL.Vec(IDL.Nat8)],
        [
          IDL.Variant({
            'Ok' : IDL.Record({ 'signature' : IDL.Vec(IDL.Nat8) }),
            'Err' : IDL.Text,
          }),
        ],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };

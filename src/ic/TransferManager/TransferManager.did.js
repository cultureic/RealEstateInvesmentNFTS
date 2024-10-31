export const idlFactory = ({ IDL }) => {
    return IDL.Service({
      'checkIfhasNFT' : IDL.Func([], [IDL.Vec(IDL.Nat64)], []),
      'createSTXWallet' : IDL.Func([], [IDL.Vec(IDL.Nat8)], []),
      'getMessage' : IDL.Func([], [IDL.Principal], ['query']),
      'getMessage2' : IDL.Func([], [IDL.Vec(IDL.Nat8)], ['query']),
      'setMessage' : IDL.Func([IDL.Text], [], []),
      'transFerNFTtoPrincipal' : IDL.Func(
          [IDL.Principal, IDL.Text],
          [IDL.Text],
          [],
        ),
    });
  };
  export const init = ({ IDL }) => { return []; };
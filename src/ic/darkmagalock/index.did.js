export const idlFactory = ({ IDL }) => {
    const SwapWithdrawToken = IDL.Record({
      'fee' : IDL.Nat,
      'address' : IDL.Text,
      'additional_amount' : IDL.Opt(IDL.Nat),
      'standard' : IDL.Text,
    });
    const SwapFeeWithdrawRequest = IDL.Record({
      'pool' : IDL.Record({
        'token0' : SwapWithdrawToken,
        'token1' : SwapWithdrawToken,
      }),
      'feeMinMultiple' : IDL.Nat,
    });
    const Token = IDL.Record({ 'address' : IDL.Text, 'standard' : IDL.Text });
    const PoolData = IDL.Record({
      'fee' : IDL.Nat,
      'key' : IDL.Text,
      'tickSpacing' : IDL.Int,
      'token0' : Token,
      'token1' : Token,
      'canisterId' : IDL.Principal,
    });
    const VariantS = IDL.Variant({
      'NAAT' : IDL.Nat,
      'POOL' : PoolData,
      'Transfer' : IDL.Nat,
    });
    const ApproveError = IDL.Variant({
      'GenericError' : IDL.Record({
        'message' : IDL.Text,
        'error_code' : IDL.Nat,
      }),
      'TemporarilyUnavailable' : IDL.Null,
      'Duplicate' : IDL.Record({ 'duplicate_of' : IDL.Nat }),
      'BadFee' : IDL.Record({ 'expected_fee' : IDL.Nat }),
      'AllowanceChanged' : IDL.Record({ 'current_allowance' : IDL.Nat }),
      'CreatedInFuture' : IDL.Record({ 'ledger_time' : IDL.Nat64 }),
      'TooOld' : IDL.Null,
      'Expired' : IDL.Record({ 'ledger_time' : IDL.Nat64 }),
      'InsufficientFunds' : IDL.Record({ 'balance' : IDL.Nat }),
    });
    const Error = IDL.Variant({
      'CommonError' : IDL.Null,
      'InternalError' : IDL.Text,
      'UnsupportedToken' : IDL.Text,
      'InsufficientFunds' : IDL.Null,
    });
    const TransferError = IDL.Variant({
      'GenericError' : IDL.Record({
        'message' : IDL.Text,
        'error_code' : IDL.Nat,
      }),
      'TemporarilyUnavailable' : IDL.Null,
      'BadBurn' : IDL.Record({ 'min_burn_amount' : IDL.Nat }),
      'Duplicate' : IDL.Record({ 'duplicate_of' : IDL.Nat }),
      'BadFee' : IDL.Record({ 'expected_fee' : IDL.Nat }),
      'CreatedInFuture' : IDL.Record({ 'ledger_time' : IDL.Nat64 }),
      'TooOld' : IDL.Null,
      'InsufficientFunds' : IDL.Record({ 'balance' : IDL.Nat }),
    });
    const VariantE = IDL.Variant({
      'Approve' : ApproveError,
      'Deposit' : Error,
      'Text' : IDL.Text,
      'Trasnfer' : TransferError,
    });
    const Result_1 = IDL.Variant({ 'ok' : VariantS, 'err' : VariantE });
    const Error__1 = IDL.Variant({
      'CommonError' : IDL.Null,
      'InternalError' : IDL.Text,
      'UnsupportedToken' : IDL.Text,
      'InsufficientFunds' : IDL.Null,
    });
    const Result_2 = IDL.Variant({ 'ok' : IDL.Nat, 'err' : Error__1 });
    const Time = IDL.Int;
    const LockRequest = IDL.Record({
      'end' : Time,
      'start' : Time,
      'amount' : IDL.Nat,
    });
    const Lock = IDL.Record({
      'end' : Time,
      'active' : IDL.Bool,
      'start' : Time,
      'amount' : IDL.Nat,
    });
    const Result_4 = IDL.Variant({ 'ok' : Lock, 'err' : IDL.Text });
    const Time__1 = IDL.Int;
    const CollectRegistry = IDL.Record({
      'amount0' : IDL.Nat,
      'amount1' : IDL.Nat,
      'timestamp' : Time__1,
    });
    const Error__2 = IDL.Variant({
      'CommonError' : IDL.Null,
      'InternalError' : IDL.Text,
      'UnsupportedToken' : IDL.Text,
      'InsufficientFunds' : IDL.Null,
    });
    const Result_19 = IDL.Variant({ 'ok' : IDL.Vec(IDL.Nat), 'err' : Error__2 });
    const PoolRegistry = IDL.Record({
      'canid' : IDL.Principal,
      'name' : IDL.Text,
    });
    const Result_3 = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
    const Result = IDL.Variant({ 'ok' : IDL.Nat, 'err' : TransferError });
    const Result_10 = IDL.Variant({ 'ok' : IDL.Bool, 'err' : Error__1 });
    return IDL.Service({
      'checkICRCBalance' : IDL.Func([IDL.Text], [IDL.Nat], []),
      'claimFees' : IDL.Func([IDL.Text, SwapFeeWithdrawRequest], [Result_1], []),
      'claimTokens' : IDL.Func([], [Result_2], []),
      'createLock' : IDL.Func([LockRequest], [Result_4], []),
      'createPoolPassToken' : IDL.Func([IDL.Text, IDL.Text], [Result_1], []),
      'depositToMagaPool' : IDL.Func([], [Result_2], []),
      'depositToken0toPool' : IDL.Func([IDL.Text, IDL.Nat], [Result_1], []),
      'depositToken1toPool' : IDL.Func([IDL.Text, IDL.Nat], [Result_1], []),
      'getCollects' : IDL.Func([], [IDL.Vec(CollectRegistry)], []),
      'getCycleBalance' : IDL.Func([], [IDL.Nat], []),
      'getICMAGABalance' : IDL.Func([], [IDL.Nat], []),
      'getICPBalance' : IDL.Func([], [IDL.Nat], []),
      'getPosition' : IDL.Func([IDL.Text], [Result_19], []),
      'getRegisteredPool' : IDL.Func([], [IDL.Vec(PoolRegistry)], []),
      'getSwaps' : IDL.Func([], [IDL.Vec(CollectRegistry)], []),
      'getUsersLock' : IDL.Func([], [Result_4], []),
      'increaseLPCreatePool' : IDL.Func(
          [IDL.Text, IDL.Text, IDL.Nat, IDL.Nat],
          [Result_1],
          [],
        ),
      'mintLiquitiy' : IDL.Func(
          [IDL.Text, IDL.Text, IDL.Nat, IDL.Nat],
          [Result_1],
          [],
        ),
      'registerLP' : IDL.Func([IDL.Text, IDL.Principal], [Result_3], []),
      'requestPasswordAndCreateIfFailed' : IDL.Func(
          [IDL.Text, IDL.Text],
          [Result_1],
          [],
        ),
      'swapFees' : IDL.Func(
          [IDL.Text, SwapFeeWithdrawRequest, IDL.Bool],
          [Result_2],
          [],
        ),
      'transferICRC1' : IDL.Func([IDL.Text], [Result], []),
      'transferLPICPSWAP' : IDL.Func([IDL.Text, IDL.Text], [Result_10], []),
      'withdrawFees' : IDL.Func(
          [IDL.Text, SwapFeeWithdrawRequest],
          [Result_1],
          [],
        ),
      'withdrawUnlockICPBalance' : IDL.Func([], [Result], []),
      'withdrawUnlockIcmagaBalance' : IDL.Func([], [Result], []),
    });
  };
  export const init = ({ IDL }) => { return []; };
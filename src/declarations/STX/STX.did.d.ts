import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface _SERVICE {
  'canister_and_caller_pub_key' : ActorMethod<
    [],
    { 'Ok' : { 'public_key' : Uint8Array | number[] } } |
      { 'Err' : string }
  >,
  'public_key' : ActorMethod<
    [],
    { 'Ok' : { 'public_key' : string } } |
      { 'Err' : string }
  >,
  'sign' : ActorMethod<
    [Uint8Array | number[]],
    { 'Ok' : string } |
      { 'Err' : string }
  >,
  'signByCallerAndCanister' : ActorMethod<
    [string],
    { 'Ok' : Uint8Array | number[] } |
      { 'Err' : string }
  >,
  'signOG' : ActorMethod<
    [Uint8Array | number[]],
    { 'Ok' : { 'signature' : Uint8Array | number[] } } |
      { 'Err' : string }
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];

import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface PropertyRequest {
  'status' : string,
  'rentValueBTC' : bigint,
  'contract' : [] | [string],
  'description' : string,
  'picture' : Uint8Array | number[],
  'privateKey' : Uint8Array | number[],
  'address' : string,
  'valueBTC' : bigint,
}
export interface _SERVICE {
  'canister_and_caller_pub_key' : ActorMethod<
    [],
    { 'Ok' : { 'public_key' : Uint8Array | number[] } } |
      { 'Err' : string }
  >,
  'crearPropertyWallet' : ActorMethod<
    [bigint],
    { 'Ok' : bigint } |
      { 'Err' : string }
  >,
  'createProperty' : ActorMethod<[PropertyRequest], bigint>,
}
export declare const idlFactory: IDL.InterfaceFactory;

import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Property {
  'id' : bigint,
  'status' : string,
  'stxWallet' : [] | [string],
  'rentValueBTC' : bigint,
  'contract' : [] | [string],
  'owner' : Principal,
  'description' : string,
  'picture' : Uint8Array | number[],
  'privateKey' : [] | [Uint8Array | number[]],
  'address' : string,
  'valueBTC' : bigint,
}
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
export interface PropertyResponse {
  'stxWallet' : [] | [string],
  'rentValueBTC' : bigint,
  'contract' : [] | [string],
  'description' : string,
  'picture' : Uint8Array | number[],
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
    { 'Ok' : Uint8Array | number[] } |
      { 'Err' : string }
  >,
  'createProperty' : ActorMethod<[PropertyRequest], bigint>,
  'getPropertyNFTData' : ActorMethod<[string], Array<PropertyResponse>>,
  'getUserProperties' : ActorMethod<[], Array<Property>>,
  'propertyDeployed' : ActorMethod<
    [bigint, string],
    { 'Ok' : string } |
      { 'Err' : string }
  >,
  'setStxPropertyWallet' : ActorMethod<
    [bigint, string],
    { 'Ok' : string } |
      { 'Err' : string }
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];

import type {Data} from './domain';
declare global {
 interface Window {
  dersDefteri?: {load():Promise<Data>;save(data:Data):Promise<void>};
 }
}
export {};

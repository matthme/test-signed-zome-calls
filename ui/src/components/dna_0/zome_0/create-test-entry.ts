
import { LitElement, html } from 'lit';
import { state, customElement } from 'lit/decorators.js';
import { InstalledCell, AppWebsocket, InstalledAppInfo, CellId, AgentPubKey } from '@holochain/client';
import { contextProvided } from '@lit-labs/context';
import { appWebsocketContext, appInfoContext } from '../../../contexts';
import { TestEntry } from '../../../types/dna_0/zome_0';
import '@material/mwc-button';
import '@type-craft/title/create-title';
import '@type-craft/content/create-content';
import { invoke } from "@tauri-apps/api/tauri";
import { serializeHash } from '@holochain-open-dev/utils';
import { decode, encode } from "@msgpack/msgpack";


interface SignedZomeCall {
  cell_id: CellId,
  zome_name: string,
  fn_name: string,
  payload: any,
  cap_secret: null,
  provenance: Uint8Array,
  signature: Uint8Array,
  nonce: number,
  expires_at: number,
}

// interface ZomeCallUnsigned {
//   provenance: AgentPubKey,
//   cell_id: CellId,
//   zome_name: string, // ZomeName
//   fn_name: string, // FunctionName
//   cap_secret: null, // Option<CapSecret>
//   payload: any, // ExternIO
//   nonce: number, // Nonce256Bits ( [u8; 32] )
//   expires_at: number, // Timestamp (from holochain_zome_types)
// }


interface ZomeCallUnsigned {
  provenance: any,
  cell_id: any,
  zome_name: string,
  fn_name: string,
  cap_secret: null,
  payload: any,
  nonce: number[],
  expires_at: number,
}

@customElement('create-test-entry')
export class CreateTestEntry extends LitElement {

    @state()
  _title: string | undefined;

  @state()
  _content: string | undefined;

  isTestEntryValid() {
    return this._title &&
      this._content;
  }

  @contextProvided({ context: appWebsocketContext })
  appWebsocket!: AppWebsocket;

  @contextProvided({ context: appInfoContext })
  appInfo!: InstalledAppInfo;

  async createTestEntry() {
    const cellData = this.appInfo.cell_data.find((c: InstalledCell) => c.role_id === 'dna_0')!;



    // const actionHash = await this.appWebsocket.callZome({
    //   cap_secret: null,
    //   cell_id: cellData.cell_id,
    //   zome_name: 'zome_0',
    //   fn_name: 'create_test_entry',
    //   payload: testEntry,
    //   provenance: cellData.cell_id[1]
    // });

    // let signedZomeCall: SignedZomeCall | undefined;

    // const input = Array.from(encode(testEntry));
    // console.log("@createTestEntry: test input: ", input);
    // try {
    //   signedZomeCall = await invoke("debug_input", { input });
    // } catch(e) {
    //   console.log("@createTestEntry: ERROR: ", e);
    // }

    // zome call expires after 1 day
    // const expiry = (new Date()).getTime() * 1000 + (24*60*60*1000*1000);
    // zome call expires after 3 seconds


    const expiry = (new Date()).getTime() * 1000 + (3*1000*1000);

    const nonce = Array.from(Array(32)).map(x=>Math.floor(Math.random()*100));

    const testEntry: TestEntry = {
      title: this._title!,
      content: this._content!,
    };

    const unsignedZomeCall: ZomeCallUnsigned = {
      provenance: Array.from(cellData.cell_id[1]), // conversion to array apparently required by tauri...
      cell_id: [Array.from(cellData.cell_id[0]), Array.from(cellData.cell_id[1])],
      zome_name: 'zome_0',
      fn_name: 'create_test_entry',
      cap_secret: null, // conversion to array for tauri probably needed as well in case not null
      payload: Array.from(encode(testEntry)),
      nonce,
      expires_at: expiry,
    };

    console.log("@createTestEntry: unsignedZomeCall: ", unsignedZomeCall);


    let signedZomeCall: SignedZomeCall | undefined;
    try {
      signedZomeCall = await invoke("sign_zome_call", { zomeCallUnsigned: unsignedZomeCall });
      console.log("@createTestEntry: signedZomeCall before conversion: ", signedZomeCall);
      console.log(signedZomeCall!.cell_id[0], signedZomeCall!.cell_id[1]);
      signedZomeCall = {
        provenance: Uint8Array.from(signedZomeCall!.provenance),
        cap_secret: signedZomeCall!.cap_secret,
        cell_id: [Uint8Array.from(signedZomeCall!.cell_id[0]), Uint8Array.from(signedZomeCall!.cell_id[1])],
        zome_name: signedZomeCall!.zome_name,
        fn_name: signedZomeCall!.fn_name,
        payload: decode(Uint8Array.from(signedZomeCall!.payload)),
        signature: Uint8Array.from(signedZomeCall!.signature),
        expires_at: signedZomeCall!.expires_at,
        nonce: signedZomeCall!.nonce,
      };
      console.log("@createTestEntry: signedZomeCall: ", signedZomeCall);
    } catch(e) {
      console.log("@createTestEntry: sign_zome_call ERROR: ", e);
    }


    console.log("signed zome call: ", signedZomeCall);

    if (signedZomeCall) {
      try {
        const actionHash = await this.appWebsocket.callZome(signedZomeCall);
        console.log("@createTestEntry: actionHash: ", actionHash);

        this.dispatchEvent(new CustomEvent('test-entry-created', {
          composed: true,
          bubbles: true,
          detail: {
            actionHash
          }
        }));
      } catch(e) {
        console.log("@createTestEntry: callZome ERROR: ", e);
      }
    }
  }

  render() {
    return html`
      <div style="display: flex; flex-direction: column">
        <span style="font-size: 18px">Create TestEntry</span>

        <create-title

      @change=${(e: Event) => this._title = (e.target as any).value}
      style="margin-top: 16px"
    ></create-title>

        <create-content

      @change=${(e: Event) => this._content = (e.target as any).value}
      style="margin-top: 16px"
    ></create-content>

        <mwc-button
          label="Create TestEntry"
          .disabled=${!this.isTestEntryValid()}
          @click=${() => this.createTestEntry()}
        ></mwc-button>
    </div>`;
  }
}

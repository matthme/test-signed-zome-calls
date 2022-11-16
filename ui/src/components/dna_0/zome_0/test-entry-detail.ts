
import { LitElement, html } from 'lit';
import { state, customElement, property } from 'lit/decorators.js';
import { InstalledCell, AppWebsocket, Record, ActionHash, InstalledAppInfo } from '@holochain/client';
import { contextProvided } from '@lit-labs/context';
import { decode } from '@msgpack/msgpack';
import { appInfoContext, appWebsocketContext } from '../../../contexts';
import { TestEntry } from '../../../types/dna_0/zome_0';
import '@material/mwc-circular-progress';
import '@type-craft/title/title-detail';
import '@type-craft/content/content-detail';

@customElement('test-entry-detail')
export class TestEntryDetail extends LitElement {
  @property()
  actionHash!: ActionHash;

  @state()
  _testEntry: TestEntry | undefined;

  @contextProvided({ context: appWebsocketContext })
  appWebsocket!: AppWebsocket;

  @contextProvided({ context: appInfoContext })
  appInfo!: InstalledAppInfo;

  async firstUpdated() {
    const cellData = this.appInfo.cell_data.find((c: InstalledCell) => c.role_id === 'dna_0')!;

    const record: Record | undefined = await this.appWebsocket.callZome({
      cap_secret: null,
      cell_id: cellData.cell_id,
      zome_name: 'zome_0',
      fn_name: 'get_test_entry',
      payload: this.actionHash,
      provenance: cellData.cell_id[1]
    });

    if (record) {
      this._testEntry = decode((record.entry as any).Present.entry) as TestEntry;
    }
  }

  render() {
    if (!this._testEntry) {
      return html`<div style="display: flex; flex: 1; align-items: center; justify-content: center">
        <mwc-circular-progress indeterminate></mwc-circular-progress>
      </div>`;
    }

    return html`
      <div style="display: flex; flex-direction: column">
        <span style="font-size: 18px">TestEntry</span>

        
    <title-detail
    
    .value=${this._testEntry.title}
      style="margin-top: 16px"
    ></title-detail>

        
    <content-detail
    
    .value=${this._testEntry.content}
      style="margin-top: 16px"
    ></content-detail>

      </div>
    `;
  }
}

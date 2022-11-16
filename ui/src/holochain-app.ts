import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  AppWebsocket,
  ActionHash,
  InstalledAppInfo,
} from '@holochain/client';
import { contextProvider } from '@lit-labs/context';
import '@material/mwc-circular-progress';

import './components/dna_0/zome_0/create-test-entry';
import './components/dna_0/zome_0/test-entry-detail';
import { appWebsocketContext, appInfoContext } from './contexts';

@customElement('holochain-app')
export class HolochainApp extends LitElement {
  @state() loading = true;
  @state() actionHash: ActionHash | undefined;

  @contextProvider({ context: appWebsocketContext })
  @property({ type: Object })
  appWebsocket!: AppWebsocket;

  @contextProvider({ context: appInfoContext })
  @property({ type: Object })
  appInfo!: InstalledAppInfo;

  async firstUpdated() {
    console.log("Trying to connect to AppWebsocket on port ", process.env.HC_PORT);
    this.appWebsocket = await AppWebsocket.connect(
      `ws://localhost:${process.env.HC_PORT}`
    );
    console.log("Connected to appwebsoket: ", this.appWebsocket);

    this.appInfo = await this.appWebsocket.appInfo({
      installed_app_id: 'test-signed-zome-calls',
    });

    this.loading = false;
  }

  render() {
    console.log("being rendered...");
    if (this.loading)
      return html`
        <mwc-circular-progress indeterminate></mwc-circular-progress>
      `;

    return html`
      <main>
        <h1>test-signed-zome-calls</h1>

        <create-test-entry @test-entry-created=${(e: CustomEvent) => this.actionHash = e.detail.actionHash}></create-test-entry>
    ${this.actionHash ? html`
      <test-entry-detail .actionHash=${this.actionHash}></test-entry-detail>
    ` : html``}
      </main>
    `;
  }

  static styles = css`
    :host {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      font-size: calc(10px + 2vmin);
      color: #1a2b42;
      max-width: 960px;
      margin: 0 auto;
      text-align: center;
      background-color: var(--lit-element-background-color);
    }

    main {
      flex-grow: 1;
    }

    .app-footer {
      font-size: calc(12px + 0.5vmin);
      align-items: center;
    }

    .app-footer a {
      margin-left: 5px;
    }
  `;
}

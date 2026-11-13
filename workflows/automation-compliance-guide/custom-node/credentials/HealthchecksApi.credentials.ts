// KONTEXT: Zugangsdaten der Healthchecks-Node. Der Ping-Key gehört zu einem Healthchecks-Projekt, die Basis-URL erlaubt auch eine selbst gehostete Instanz.
// BEISPIEL: Ping-Key "abc123", Basis-URL "https://hc-ping.com" ergibt Pings an https://hc-ping.com/abc123/<slug>.

// ---------- ABSCHNITT 1: Importe ----------
// „Die Typen, die n8n für Zugangsdaten vorgibt.“
import { ICredentialType, INodeProperties } from 'n8n-workflow';

// ---------- ABSCHNITT 2: Klasse ----------
// „Die Klasse beschreibt die Zugangsdaten, die man in n8n unter Credentials einträgt.“
export class HealthchecksApi implements ICredentialType {
	// „Interner Name, auf den die Node verweist.“
	name = 'healthchecksApi';
	// „Name, wie er in n8n angezeigt wird.“
	displayName = 'Healthchecks API';
	// „Link zur Dokumentation der Ping-URLs.“
	documentationUrl = 'https://healthchecks.io/docs/http_api/';
	// „Die zwei Felder des Formulars.“
	properties: INodeProperties[] = [
		{
			// „Der Ping-Key des Projekts (Healthchecks: Project Settings), als Passwortfeld versteckt.“
			displayName: 'Ping Key',
			name: 'pingKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
		},
		{
			// „Basis-URL: Standard ist die Cloud, bei Self-Hosting die eigene Adresse.“
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://hc-ping.com',
			required: true,
		},
	];
}

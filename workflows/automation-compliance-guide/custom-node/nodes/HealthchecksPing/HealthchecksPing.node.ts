// KONTEXT: Custom Node "Healthchecks Ping". Schickt Start-, Erfolgs-, Fehler- oder Log-Pings an Healthchecks.io und gibt die Eingabedaten unverändert weiter, sodass man sie mitten in einen Workflow setzen kann.
// BEISPIEL: Event = Fail, Slug = compliance-guide, Message = "Summarize failed" ergibt einen POST an https://hc-ping.com/<ping-key>/compliance-guide/fail mit diesem Text als Body.

// ---------- ABSCHNITT 1: Importe und Konstanten ----------
// „Typen und Hilfen aus n8n-workflow.“
import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionTypes,
	NodeOperationError,
} from 'n8n-workflow';

// „Healthchecks erlaubt in Slugs nur Kleinbuchstaben, Ziffern, Unterstrich und Bindestrich.“
const SLUG_PATTERN = /^[a-z0-9_-]+$/;
// „Die Run-ID (rid) muss eine UUID in der üblichen Schreibweise sein.“
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// „Healthchecks speichert höchstens die ersten 100 kB des Bodys.“
const MAX_BODY_CHARS = 100000;

// ---------- ABSCHNITT 2: Beschreibung der Node ----------
// „Die Klasse ist die Node, so wie n8n sie lädt.“
export class HealthchecksPing implements INodeType {
	// „Aussehen, Felder und Zugangsdaten der Node.“
	description: INodeTypeDescription = {
		displayName: 'Healthchecks Ping',
		name: 'healthchecksPing',
		icon: 'file:healthchecks.svg',
		group: ['output'],
		version: 1,
		// „Untertitel unter dem Node-Namen: Event und Slug.“
		subtitle: '={{ $parameter["event"] + ": " + $parameter["slug"] }}',
		description: 'Send start, success, fail or log pings to Healthchecks.io',
		defaults: { name: 'Healthchecks Ping' },
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'healthchecksApi', required: true }],
		properties: [
			{
				// „Welche Art Ping gesendet wird.“
				displayName: 'Event',
				name: 'event',
				type: 'options',
				options: [
					{ name: 'Success', value: 'success', description: 'The job finished fine' },
					{ name: 'Start', value: 'start', description: 'The job has started (measures run time)' },
					{ name: 'Fail', value: 'fail', description: 'The job failed' },
					{ name: 'Log', value: 'log', description: 'Add a log entry without changing the status' },
				],
				default: 'success',
			},
			{
				// „Name des Checks in Healthchecks (Pflicht).“
				displayName: 'Check Slug',
				name: 'slug',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'compliance-guide',
				description: 'Slug of the check: lowercase letters, digits, hyphens and underscores',
			},
			{
				// „Optionaler Text, der als Body mitgeschickt und in Healthchecks angezeigt wird.“
				displayName: 'Message',
				name: 'message',
				type: 'string',
				typeOptions: { rows: 3 },
				default: '',
				description: 'Optional text shown with the ping in Healthchecks (first 100 kB are kept)',
			},
			{
				// „Zusatzoptionen, standardmäßig aus.“
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Create Check If Missing',
						name: 'createIfMissing',
						type: 'boolean',
						default: false,
						description: 'Whether Healthchecks should create the check on the first ping (needs the project setting to allow it)',
					},
					{
						displayName: 'Run ID',
						name: 'runId',
						type: 'string',
						default: '',
						placeholder: '123e4567-e89b-12d3-a456-426614174000',
						description: 'Optional UUID that pairs a start ping with its success or fail ping, useful for parallel runs',
					},
					{
						displayName: 'Add Result to Output',
						name: 'includeResult',
						type: 'boolean',
						default: false,
						description: 'Whether to add a "healthchecks" field (ok, status, event, slug) to every output item',
					},
				],
			},
		],
	};

	// ---------- ABSCHNITT 3: Ausführung ----------
	// „Diese Funktion läuft, wenn die Node im Workflow drankommt.“
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		// „Alle Eingabe-Items.“
		const items = this.getInputData();
		// „Hier landen die Ausgabe-Items.“
		const out: INodeExecutionData[] = [];
		// „Ping-Key und Basis-URL aus den Zugangsdaten, überflüssige Schrägstriche am Ende weg.“
		const cred = await this.getCredentials('healthchecksApi');
		const base = String(cred.baseUrl).replace(/\/+$/, '');
		const pingKey = String(cred.pingKey).trim();

		// „Jedes Eingabe-Item bekommt einen eigenen Ping.“
		for (let i = 0; i < items.length; i++) {
			try {
				// „Die Felder der Node für dieses Item lesen.“
				const event = this.getNodeParameter('event', i) as string;
				const slug = (this.getNodeParameter('slug', i) as string).trim();
				const message = this.getNodeParameter('message', i, '') as string;
				const options = this.getNodeParameter('options', i, {}) as {
					createIfMissing?: boolean;
					runId?: string;
					includeResult?: boolean;
				};

				// „Eingaben prüfen, bevor etwas gesendet wird.“
				if (!SLUG_PATTERN.test(slug)) {
					throw new NodeOperationError(this.getNode(), 'Invalid slug', {
						description: 'Use only lowercase letters, digits, hyphens and underscores.',
						itemIndex: i,
					});
				}
				if (options.runId && !UUID_PATTERN.test(options.runId)) {
					throw new NodeOperationError(this.getNode(), 'Invalid run ID', {
						description: 'The run ID must be a UUID like 123e4567-e89b-12d3-a456-426614174000.',
						itemIndex: i,
					});
				}

				// „Pfad: Erfolg hat keinen Zusatz, die anderen Events hängen /start, /fail oder /log an.“
				const suffix = event === 'success' ? '' : '/' + event;
				// „Parameter für die Adresse: create=1 und rid, nur wenn gewählt.“
				const qs: IDataObject = {};
				if (options.createIfMissing) qs.create = 1;
				if (options.runId) qs.rid = options.runId;
				// „Mit Text als POST, ohne Text als GET.“
				const hasBody = message !== '';

				// „Den Ping senden. Fehlermeldungen enthalten nie die Adresse, weil darin der Ping-Key steht.“
				let status: number;
				try {
					const res = await this.helpers.httpRequest({
						method: hasBody ? 'POST' : 'GET',
						url: `${base}/${encodeURIComponent(pingKey)}/${slug}${suffix}`,
						qs,
						body: hasBody ? message.slice(0, MAX_BODY_CHARS) : undefined,
						headers: hasBody ? { 'Content-Type': 'text/plain; charset=utf-8' } : undefined,
						returnFullResponse: true,
						timeout: 10000,
					});
					status = res.statusCode;
				} catch (error) {
					// „Statuscode aus dem Fehler lesen, wenn vorhanden.“
					const e = error as { httpCode?: string | number; statusCode?: number };
					const code = e.httpCode ?? e.statusCode;
					// „Hilfetext je nach Code.“
					const hint =
						String(code) === '404'
							? 'No check with this slug in the project. Check the slug or enable "Create Check If Missing".'
							: String(code) === '409'
								? 'The slug matches more than one check.'
								: String(code) === '429'
									? 'Rate limit: at most 5 pings per minute per check.'
									: 'Check the base URL, the ping key and the network connection.';
					throw new NodeOperationError(
						this.getNode(),
						`Healthchecks ping failed for slug "${slug}"${code ? ' (HTTP ' + code + ')' : ''}`,
						{ description: hint, itemIndex: i },
					);
				}

				// „Eingabedaten unverändert weitergeben, auf Wunsch mit dem Ping-Ergebnis.“
				const json: IDataObject = { ...items[i].json };
				if (options.includeResult) json.healthchecks = { ok: true, status, event, slug };
				out.push({ json, binary: items[i].binary, pairedItem: { item: i } });
			} catch (error) {
				// „Bei „Continue On Fail“ wird der Fehler als Item weitergegeben, sonst bricht die Node ab.“
				if (this.continueOnFail()) {
					out.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
					continue;
				}
				throw error;
			}
		}
		// „Ergebnis an die nächste Node.“
		return [out];
	}
}

import { Inject, Injectable } from "@angular/core";
import { Posthog } from "@capawesome/capacitor-posthog";
import { POSTHOG_CONFIG } from "@wm-core/store/conf/conf.token";
import { WmPosthogClient, WmPosthogConfig, WmPosthogProps } from "@wm-types/posthog";

@Injectable()
export class PosthogCapacitorClient implements WmPosthogClient {
  private initialized = false;

  constructor(@Inject(POSTHOG_CONFIG) private config: WmPosthogConfig) {}

  async capture(event: string, props: WmPosthogProps = {}): Promise<void> {
    // Lazy initialization per capture
    await this.init();
    if (!this.initialized) {
      console.warn('[PostHog] Cannot capture event - PostHog not initialized');
      return;
    }
    console.log(`[PostHog] Capturing event '${event}' with properties:`, props);
    try {
      await Posthog.capture({event, properties: props});
      console.log(`[PostHog] Event '${event}' captured successfully`);
      // Forza l'invio immediato degli eventi
      await Posthog.flush();
      console.log(`[PostHog] Flushed events to server`);
    } catch (error) {
      console.error(`[PostHog] Failed to capture event '${event}':`, error);
      throw error;
    }
  }

  async identify(distinctId: string, props: WmPosthogProps = {}): Promise<void> {
    // Lazy initialization per identify
    await this.init();
    if (!this.initialized) return;
    await Posthog.identify({distinctId, userProperties: props});
  }

  async initAndRegister(props: WmPosthogProps): Promise<void> {
    // Inizializza PostHog
    await this.init();
    if (!this.initialized) {
      console.warn('[PostHog] Cannot register properties: PostHog not initialized');
      return;
    }

    console.log('[PostHog] Registering properties (raw):', JSON.stringify(props, null, 2));

    // Identifica e verifica che tutte le proprietà siano definite e non vuote
    const invalidProps: Array<{key: string; value: any; reason: string}> = [];

    for (const [key, value] of Object.entries(props ?? {})) {
      if (value === undefined) {
        invalidProps.push({key, value, reason: 'undefined'});
        console.error(`[PostHog] ERROR: Property '${key}' is UNDEFINED!`);
      } else if (value === null) {
        invalidProps.push({key, value, reason: 'null'});
        console.error(`[PostHog] ERROR: Property '${key}' is NULL!`);
      } else if (typeof value === 'string' && value.trim() === '') {
        invalidProps.push({key, value, reason: 'empty string'});
        console.error(`[PostHog] ERROR: Property '${key}' is EMPTY STRING!`);
      } else {
        console.log(`[PostHog] Property '${key}' is valid:`, typeof value, value);
      }
    }

    // Se ci sono proprietà invalide, lancia un errore
    if (invalidProps.length > 0) {
      const errorMsg = `PostHog register failed: Invalid properties: ${invalidProps
        .map(p => `${p.key} (${p.reason})`)
        .join(', ')}. All properties must be defined and non-empty before calling register.`;
      console.error('[PostHog]', errorMsg);
      console.error('[PostHog] Invalid properties details:', invalidProps);
      throw new Error(errorMsg);
    }

    // Registra tutte le proprietà (ora siamo sicuri che sono tutte valide)
    // Il plugin nativo accetta 'any' come tipo, quindi passiamo il valore originale
    for (const [key, value] of Object.entries(props ?? {})) {
      console.log(
        `[PostHog] Registering property '${key}':`,
        typeof value,
        value,
        'JSON:',
        JSON.stringify(value),
      );
      try {
        // WORKAROUND: Il plugin iOS usa getObject("value") che non funziona con valori primitivi
        // Passiamo il valore come oggetto wrapper per far funzionare getObject
        // Il plugin poi estrae il valore dall'oggetto
        const wrappedValue = {_value: value};
        console.log(`[PostHog] Wrapping value for iOS compatibility:`, wrappedValue);
        await Posthog.register({key, value: wrappedValue});
        console.log(`[PostHog] Successfully registered property '${key}'`);
      } catch (error) {
        console.error(`[PostHog] Failed to register property '${key}':`, error);
        console.error(
          `[PostHog] Property details: key="${key}", value=`,
          value,
          `type=${typeof value}, JSON=${JSON.stringify(value)}`,
        );
        // Non lanciare l'errore, continua con le altre proprietà
        // throw error;
      }
    }

    // Invia un evento di inizio sessione dopo aver registrato le proprietà
    // Questo assicura che la sessione venga tracciata con tutte le proprietà super
    try {
      await Posthog.capture({event: '$session_start', properties: {}});
      await Posthog.flush();
      console.log('[PostHog] Session start event sent');
    } catch (error) {
      console.warn('[PostHog] Failed to send session start event:', error);
    }
  }

  async reset(): Promise<void> {
    await Posthog.reset();
    this.initialized = false;
  }

  private async init(): Promise<void> {
    if (this.initialized) {
      console.log('[PostHog] Already initialized');
      return;
    }
    if (!this.config?.enabled) {
      console.warn('[PostHog] Initialization skipped: PostHog is disabled');
      return;
    }
    if (!this.config?.apiKey) {
      console.warn('[PostHog] Initialization skipped: API key is missing');
      return;
    }

    console.log('[PostHog] Initializing with config:', {
      apiKey: this.config.apiKey ? `${this.config.apiKey.substring(0, 10)}...` : 'missing',
      host: this.config.host || 'default',
      enabled: this.config.enabled,
    });

    try {
      const options: any = {
        apiKey: this.config.apiKey,
        host: this.config.host,
        sessionReplay: true,
        has_recording: true,
        enableSessionReplay: true,
      };
      await Posthog.setup(options);
      this.initialized = true;
      console.log('[PostHog] Successfully initialized');
    } catch (error) {
      console.error('[PostHog] Initialization failed:', error);
      this.initialized = false;
    }
  }
}

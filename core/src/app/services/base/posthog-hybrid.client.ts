import {Inject, Injectable} from '@angular/core';
import {Capacitor} from '@capacitor/core';
import {Posthog, SetupOptions} from '@capawesome/capacitor-posthog';
import {POSTHOG_CONFIG} from '@wm-core/store/conf/conf.token';
import {WmPosthogClient, WmPosthogConfig, WmPosthogProps} from '@wm-types/posthog';
import posthog from 'posthog-js';

/**
 * Client ibrido PostHog che combina:
 * - posthog-js per il session recording (funziona nel WebView)
 * - Plugin Capacitor per eventi, identify, register (più performante su mobile)
 */
@Injectable()
export class PosthogHybridClient implements WmPosthogClient {
  private capacitorInitialized = false;
  private webInitialized = false;
  private readonly isNativePlatform: boolean;

  constructor(@Inject(POSTHOG_CONFIG) private config: WmPosthogConfig) {
    // Verifica se siamo su una piattaforma nativa (iOS/Android)
    const platform = Capacitor.getPlatform();
    this.isNativePlatform = platform === 'ios' || platform === 'android';
  }

  async capture(event: string, props: WmPosthogProps = {}): Promise<void> {
    // Inizializza entrambi i client se necessario
    await Promise.all([this.initCapacitor(), this.initWeb()]);

    console.log(`[PostHog Hybrid] Capturing event '${event}' with properties:`, props);

    // Usa Capacitor per gli eventi (più performante su mobile)
    if (this.capacitorInitialized) {
      try {
        await Posthog.capture({event, properties: props});
        await Posthog.flush(); // Forza l'invio immediato
        console.log(`[PostHog Capacitor] Event '${event}' captured successfully`);
      } catch (error) {
        console.error(`[PostHog Capacitor] Failed to capture event '${event}':`, error);
      }
    }

    // Usa posthog-js per sincronizzare (soprattutto per session recording)
    if (this.webInitialized) {
      try {
        posthog.capture(event, props);
        console.log(`[PostHog Web] Event '${event}' captured successfully`);
      } catch (error) {
        console.error(`[PostHog Web] Failed to capture event '${event}':`, error);
      }
    }
  }

  async identify(distinctId: string, props: WmPosthogProps = {}): Promise<void> {
    await Promise.all([this.initCapacitor(), this.initWeb()]);

    // Sincronizza identify su entrambi
    if (this.capacitorInitialized) {
      try {
        await Posthog.identify({distinctId, userProperties: props});
        console.log(`[PostHog Capacitor] User identified: ${distinctId}`);
      } catch (error) {
        console.error(`[PostHog Capacitor] Failed to identify user:`, error);
      }
    }

    if (this.webInitialized) {
      try {
        posthog.identify(distinctId, props);
        console.log(`[PostHog Web] User identified: ${distinctId}`);
      } catch (error) {
        console.error(`[PostHog Web] Failed to identify user:`, error);
      }
    }
  }

  async initAndRegister(props: WmPosthogProps): Promise<void> {
    // Inizializza entrambi i client
    await Promise.all([this.initCapacitor(), this.initWeb()]);

    console.log('[PostHog Hybrid] Registering properties:', JSON.stringify(props, null, 2));

    // Valida le proprietà
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

    if (invalidProps.length > 0) {
      const errorMsg = `PostHog register failed: Invalid properties: ${invalidProps
        .map(p => `${p.key} (${p.reason})`)
        .join(', ')}. All properties must be defined and non-empty before calling register.`;
      console.error('[PostHog]', errorMsg);
      throw new Error(errorMsg);
    }

    // Registra le proprietà su Capacitor
    if (this.capacitorInitialized) {
      for (const [key, value] of Object.entries(props ?? {})) {
        try {
          // WORKAROUND: Il plugin iOS usa getObject("value") che non funziona con valori primitivi
          const wrappedValue = {_value: value};
          await Posthog.register({key, value: wrappedValue});
          console.log(`[PostHog Capacitor] Successfully registered property '${key}'`);
        } catch (error) {
          console.error(`[PostHog Capacitor] Failed to register property '${key}':`, error);
        }
      }
    }

    // Registra le proprietà su posthog-js (super properties)
    if (this.webInitialized) {
      for (const [key, value] of Object.entries(props ?? {})) {
        try {
          posthog.register({[key]: value});
          console.log(`[PostHog Web] Successfully registered property '${key}'`);
        } catch (error) {
          console.error(`[PostHog Web] Failed to register property '${key}':`, error);
        }
      }
    }

    // Invia evento di inizio sessione
    try {
      await this.capture('$session_start', {});
      console.log('[PostHog Hybrid] Session start event sent');
    } catch (error) {
      console.warn('[PostHog Hybrid] Failed to send session start event:', error);
    }
  }

  async reset(): Promise<void> {
    if (this.capacitorInitialized) {
      try {
        await Posthog.reset();
        this.capacitorInitialized = false;
        console.log('[PostHog Capacitor] Reset completed');
      } catch (error) {
        console.error('[PostHog Capacitor] Failed to reset:', error);
      }
    }

    if (this.webInitialized) {
      try {
        posthog.reset();
        this.webInitialized = false;
        console.log('[PostHog Web] Reset completed');
      } catch (error) {
        console.error('[PostHog Web] Failed to reset:', error);
      }
    }
  }

  /**
   * Inizializza il plugin Capacitor PostHog
   */
  private async initCapacitor(): Promise<void> {
    if (this.capacitorInitialized) {
      return;
    }

    if (!this.config?.enabled || !this.config?.apiKey) {
      console.warn('[PostHog Capacitor] Initialization skipped: disabled or missing API key');
      return;
    }

    // Su piattaforme native, inizializza il plugin Capacitor
    if (this.isNativePlatform) {
      try {
        const options: SetupOptions = {
          apiKey: this.config.apiKey,
          host: this.config.host,
        };
        await Posthog.setup(options);
        this.capacitorInitialized = true;
        console.log('[PostHog Capacitor] Successfully initialized');
      } catch (error) {
        console.error('[PostHog Capacitor] Initialization failed:', error);
      }
    } else {
      console.log('[PostHog Capacitor] Skipping initialization (not native platform)');
    }
  }

  /**
   * Inizializza posthog-js per il session recording
   */
  private async initWeb(): Promise<void> {
    if (this.webInitialized) {
      return;
    }

    if (!this.config?.enabled || !this.config?.apiKey) {
      console.warn('[PostHog Web] Initialization skipped: disabled or missing API key');
      return;
    }

    try {
      // Inizializza posthog-js con session recording abilitato
      posthog.init(this.config.apiKey, {
        api_host: this.config.host || 'https://us.i.posthog.com',
        loaded: (posthog) => {
          console.log('[PostHog Web] Successfully initialized with session recording');
        },
        // Abilita il session recording
        session_recording: {
          recordCrossOriginIframes: false,
        },
        // Altre opzioni utili
        capture_pageview: false, // Gestiamo manualmente i page view
        capture_pageleave: true,
      });

      this.webInitialized = true;
      console.log('[PostHog Web] Successfully initialized');
    } catch (error) {
      console.error('[PostHog Web] Initialization failed:', error);
    }
  }
}


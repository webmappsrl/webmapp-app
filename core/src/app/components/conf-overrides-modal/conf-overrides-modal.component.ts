import {Component, OnInit} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {map, take} from 'rxjs/operators';
import {ICONF} from '@wm-core/types/config';
import {conf} from '@wm-core/store/conf/conf.selector';
import {loadConf} from '@wm-core/store/conf/conf.actions';
import {getConfOverrides, saveConfOverrides} from '@wm-core/utils/localForage';

interface BooleanConfigItem {
  key: string;
  value: boolean;
  label: string;
}

interface CategoryConfig {
  category: string;
  items: BooleanConfigItem[];
}

// Mappatura delle label personalizzate per i toggle
// Formato: 'category.key' => 'Label personalizzata'
const CUSTOM_LABELS: {[key: string]: string} = {
  'APP.forceToReleaseUpdate': 'Forza Aggiornamento Release',
  'AUTH.enable': 'Mostra autenticazione',
  'AUTH.showAtStartup': 'Mostra autenticazione all\'avvio',
  'GEOLOCATION.record.enable': 'Abilita Registrazione Geolocalizzazione',
  'MAP.pois.apppoisApiLayer': 'Livello API POI App',
  'OPTIONS.download_track_enable': 'Mostra Download Tracce',
  'OPTIONS.showDownloadTiles': 'Mostra Download Tiles',
  // Aggiungi qui altre label personalizzate se necessario
};

@Component({
  standalone: false,
  selector: 'wm-conf-overrides-modal',
  templateUrl: './conf-overrides-modal.component.html',
  styleUrls: ['./conf-overrides-modal.component.scss'],
})
export class ConfOverridesModalComponent implements OnInit {
  conf$: Observable<ICONF> = this._store.select(conf);
  categories: CategoryConfig[] = [];
  localOverrides: {[key: string]: any} = {};

  constructor(
    private _modalController: ModalController,
    private _store: Store<any>,
  ) {}

  async ngOnInit(): Promise<void> {
    // Carica gli override locali
    this.localOverrides = (await getConfOverrides()) || {};

    // Costruisci le categorie con i valori booleani
    this.conf$.pipe(take(1)).subscribe(conf => {
      if (conf && conf.loaded) {
        this.categories = this._extractBooleanConfigs(conf);
      }
    });
  }

  private _extractBooleanConfigs(conf: ICONF): CategoryConfig[] {
    const categories: CategoryConfig[] = [];

    // MAP
    if (conf.MAP) {
      const mapItems: BooleanConfigItem[] = [];
      this._extractBooleanFromObject(conf.MAP, 'MAP', mapItems, '');
      if (mapItems.length > 0) {
        categories.push({category: 'MAP', items: mapItems});
      }
    }

    // AUTH
    if (conf.AUTH) {
      const authItems: BooleanConfigItem[] = [];
      this._extractBooleanFromObject(conf.AUTH, 'AUTH', authItems, '');
      if (authItems.length > 0) {
        categories.push({category: 'AUTH', items: authItems});
      }
    }

    // GEOLOCATION
    if (conf.GEOLOCATION) {
      const geolocationItems: BooleanConfigItem[] = [];
      this._extractBooleanFromObject(conf.GEOLOCATION, 'GEOLOCATION', geolocationItems, '');
      if (geolocationItems.length > 0) {
        categories.push({category: 'GEOLOCATION', items: geolocationItems});
      }
    }

    // OPTIONS
    if (conf.OPTIONS) {
      const optionsItems: BooleanConfigItem[] = [];
      this._extractBooleanFromObject(conf.OPTIONS, 'OPTIONS', optionsItems, '');
      if (optionsItems.length > 0) {
        categories.push({category: 'OPTIONS', items: optionsItems});
      }
    }

    return categories;
  }

  private _extractBooleanFromObject(
    obj: any,
    category: string,
    items: BooleanConfigItem[],
    prefix: string,
  ): void {
    if (!obj || typeof obj !== 'object') return;

    Object.keys(obj).forEach(key => {
      const value = obj[key];
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'boolean') {
        items.push({
          key: fullKey,
          value: this._getOverrideValue(category, fullKey, value),
          label: this._getLabel(category, fullKey),
        });
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Ricorsione per oggetti annidati (es. clustering, showAppDownloadButtons)
        this._extractBooleanFromObject(value, category, items, fullKey);
      }
    });
  }

  private _getOverrideValue(category: string, key: string, defaultValue: boolean): boolean {
    if (this.localOverrides[category] && this.localOverrides[category][key] !== undefined) {
      return this.localOverrides[category][key];
    }
    return defaultValue;
  }

  private _getLabel(category: string, key: string): string {
    // Controlla se esiste una label personalizzata
    const customLabelKey = `${category}.${key}`;
    if (CUSTOM_LABELS[customLabelKey]) {
      return CUSTOM_LABELS[customLabelKey];
    }

    // Genera un'etichetta leggibile dalla chiave
    // Gestisce chiavi annidate come "clustering.enable"
    const displayKey = key.includes('.') ? key.split('.').pop() || key : key;
    return displayKey
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  onToggleChange(category: string, key: string, value: boolean): void {
    if (!this.localOverrides[category]) {
      this.localOverrides[category] = {};
    }
    // Gestisce chiavi annidate come "clustering.enable"
    const keys = key.split('.');
    if (keys.length === 1) {
      this.localOverrides[category][key] = value;
    } else {
      // Crea la struttura annidata
      let current = this.localOverrides[category];
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
    }

    // Aggiorna il valore nel componente per riflettere immediatamente le modifiche
    const categoryConfig = this.categories.find(c => c.category === category);
    if (categoryConfig) {
      const item = categoryConfig.items.find(i => i.key === key);
      if (item) {
        item.value = value;
      }
    }
  }

  async save(): Promise<void> {
    await saveConfOverrides(this.localOverrides);
    // Ricarica la configurazione per applicare le modifiche
    this._store.dispatch(loadConf());
    this.dismiss();
  }

  async reset(): Promise<void> {
    this.localOverrides = {};
    await saveConfOverrides({});
    // Ricarica la configurazione
    this._store.dispatch(loadConf());
    this.dismiss();
  }

  dismiss(): void {
    this._modalController.dismiss();
  }
}

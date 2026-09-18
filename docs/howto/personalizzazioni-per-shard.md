# Personalizzare la UI per un singolo shard

Quando una feature richiede una UI **strutturalmente** diversa — non solo CSS — per un singolo
shard, non si modifica il file condiviso: si usa `fileReplacements` di Angular, già presente in
`core/angular.json` per `environment.prod.ts` e per lo shard `stelvio`.

I vincoli che fanno fallire questo pattern stanno in
[.claude/rules/file-replacements.md](../../.claude/rules/file-replacements.md): leggili prima,
sono tre e ognuno costa un pomeriggio.

## Procedura

1. Crea il gemello `<nome>.<shard>.ts`, con `templateUrl` che punta a `<nome>.<shard>.html`, e il
   relativo `.html`.
2. Aggiungi la configuration in `core/angular.json`, **sia** sotto `architect.build.configurations`
   **sia** sotto `architect.serve.configurations`:

   ```json
   "camminiditalia": {
     "fileReplacements": [
       {"replace": "src/app/pages/profile/profile.page.ts",
        "with": "src/app/pages/profile/profile.page.camminiditalia.ts"}
     ]
   }
   ```

3. Più `fileReplacements` per shard diversi convivono senza conflitto se toccano file diversi, e
   più configuration si combinano con la virgola (`--configuration=production,camminiditalia`).

## Quale componente sostituire: foglia o genitore

**Il numero di entry in `angular.json` non è il criterio.** Costano due righe, sono greppabili e
non pesano nemmeno a venti. Il costo vero di ogni replace è **quanta logica non correlata alla
personalizzazione finisce duplicata** nella variante: quella logica va tenuta sincronizzata a mano
per tutta la vita del progetto, e più grande è il componente sostituito più cresce la superficie di
disallineamento silenzioso.

1. **Mappa tutti i punti di montaggio** del componente prima di scegliere il livello.
2. **Se è montato in più punti fratelli** e la personalizzazione deve valere su tutti, l'unico punto
   che li copre è il componente stesso — o il più basso antenato comune, se esiste. Salire più in
   alto non riduce le entry: le moltiplica.
3. **Se è montato in un punto solo**, preferisci la **foglia**: il genitore porta con sé routing,
   stato e altri figli non toccati, che finiscono comunque duplicati. Sali di livello solo se la
   personalizzazione tocca anche il genitore, o se più personalizzazioni coordinate su figli
   fratelli sarebbero più incoerenti gestite separatamente.
4. **Segnale d'allarme**: se la motivazione per salire è «così ho meno righe in `angular.json`» o
   «faccio prima», è quasi sempre sbagliata — si scambia un costo piccolo e visibile con uno
   invisibile e crescente.

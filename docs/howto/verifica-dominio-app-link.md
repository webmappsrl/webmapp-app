# Attivare la verifica dominio↔app per un nuovo shard/app

Quando un nuovo shard o una nuova app Webmapp attiva Universal Link (iOS) / App Link (Android),
il sistema operativo deve poter verificare `/.well-known/apple-app-site-association` e
`/.well-known/assetlinks.json` sul dominio dello shard. Perché questo serva e cosa succede quando
manca è spiegato in [docs/knowledge/deep-link.md](../knowledge/deep-link.md).

## Procedura

1. Verifica con `curl -sI` che `https://<dominio-shard>/.well-known/apple-app-site-association` e
   `.../assetlinks.json` rispondano `200`, `Content-Type` JSON, **senza** header `Location`
   (nessun redirect nella catena).
2. Se il vhost dello shard usa lo stesso schema di catch-all SPA descritto in
   [docs/knowledge/deep-link.md](../knowledge/deep-link.md) (`RewriteRule ^ /index.html [L]` su
   tutto ciò che non è un file reale), e i due file non esistono nel suo `DocumentRoot`, aggiungi
   nel vhost, **prima** del blocco `<Directory>` della SPA, le due righe `Alias` verso il registry
   condiviso (vedi oc:8580 per l'esempio applicato a `camminiditalia.webmapp.it`):

   ```apache
   Alias /.well-known/apple-app-site-association /var/www/html/app.geohub.webmapp.it/.well-known/apple-app-site-association
   Alias /.well-known/assetlinks.json /var/www/html/app.geohub.webmapp.it/.well-known/assetlinks.json
   ```

3. Dopo la modifica: `apache2ctl configtest` prima di `systemctl reload apache2` (mai `restart` su
   un host multi-tenant), poi ripeti il check del punto 1.
4. Ricorda che iOS/Android **cachano** l'esito di una verifica fallita: un device che ha già
   fallito potrebbe non ri-verificare senza disinstallare/reinstallare l'app — comunicarlo a chi fa
   da tester prima di dichiarare il fix inefficace.

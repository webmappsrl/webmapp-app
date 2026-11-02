# Regole R8/ProGuard della build Android di release, comuni a tutte le app (oc:8892).
#
# Questo file è copiato dal gulpfile in instances/<app>/android/app/proguard-rules.pro a ogni build
# Android: modificarlo qui, mai dentro instances/, dove verrebbe sovrascritto.
#
# Le classi dei plugin Capacitor sono già protette dalle regole di @capacitor/android.
# Aggiungere un -keep solo per una libreria che si rompe in release (e non in debug), limitato al
# suo pacchetto, con un commento che dice quale funzione si rompeva.

# Stack trace con file e numeri di riga; generics e annotazioni usati dalla conversione JSON.
-keepattributes SourceFile,LineNumberTable,Signature,*Annotation*

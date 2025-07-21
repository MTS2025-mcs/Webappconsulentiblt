# 🚀 Setup Finale - Webapp Consulenti Cloud

## Passo 1: Configura le Credenziali Supabase

Nel file `.env.local` sostituisci i valori con le tue credenziali:

```bash
# Vai nel tuo progetto Supabase > Settings > API
# Copia Project URL e anon public key

NEXT_PUBLIC_SUPABASE_URL=https://TUO-PROJECT-ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

## Passo 2: Testa l'App Localmente

```bash
cd /Users/mts/CascadeProjects/webapp-consulenti-cloud
npm run dev
```

Apri http://localhost:3000 nel browser

## Passo 3: Testa le Funzionalità

1. **Registra un nuovo consulente**
2. **Aggiungi alcuni clienti**  
3. **Inserisci transazioni VSS, G.I., VSD**
4. **Verifica calcolo provvigioni**
5. **Testa logout/login**

## Passo 4: Deploy su Vercel (Gratuito)

1. Vai su [vercel.com](https://vercel.com)
2. Connetti il tuo account GitHub
3. Importa il progetto
4. Aggiungi le variabili d'ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy automatico!

## 🎯 Risultato Finale

- ✅ Webapp multi-utente sicura
- ✅ Ogni consulente vede solo i suoi dati
- ✅ Accesso da qualsiasi dispositivo
- ✅ Backup automatico nel cloud
- ✅ Calcolo provvigioni in tempo reale
- ✅ Completamente gratuito!

## 📞 Supporto

Se hai problemi, controlla:
1. Le credenziali Supabase sono corrette
2. Il database è stato creato correttamente
3. Le tabelle esistono in Supabase

La webapp è pronta per l'uso aziendale! 🚀

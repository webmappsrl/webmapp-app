# Wm-App Configuration file

[&larr; Main docs](/README.md)

The app/webapp built with this project can be configured to match the client needs. The configuration file is by default the config.json file that must be reachable at the root level of the app domain.
The file should follow the interface defined at [here](/core/src/app/classes/types/config.d.ts).
The file is composed by various sections each configuring a specific behaviour of the app. The following are the available configurable sections:

| Section                | Mandatory | Description                                                         |
| ---------------------- | --------- | ------------------------------------------------------------------- |
| [APP](sections/app.md) | `true`    | Configures some app specific metadata as the app name or the app id |

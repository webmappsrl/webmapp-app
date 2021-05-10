# Section APP

[&larr; Main config docs](/docs/config/config.md)

The app section configures some metadata of the app.

## Main section

| Key    | Type     | Mandatory | Description                                                                                                                                                                                   |
| ------ | -------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name` | `string` | `true`    | Defines the app name that will be visible as the webapp title or the app title on the icon of the app                                                                                         |
| `id`   | `string` | `true`    | Defines the app id. This must be set if the app need to be published as mobile app. This field must be filled with `it.webmapp.APP_ID` where `APP_ID`should be a unique identifier of the app |

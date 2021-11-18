# Translatable

[&larr; Main config docs](/docs/config/config.md)

A lot of the sections and subsections of the configuration file contain text that is shown directly in the app and therefor should be translatable. For this reason every translatable configuration can contain the translations definition under the `translations` property.
The property must be an object. The object keys must be a two letters string for a supported language with as value an object with an association between keys and the respective translated value.

## Supported languages

| Language  | Language code |
| --------- | ------------- |
| Dutch     | `nl`          |
| English   | `en`          |
| French    | `fr`          |
| German    | `de`          |
| Italian   | `it`          |
| Norwegian | `nb`          |
| Persian   | `fa`          |
| Spanish   | `es`          |

## Example

As an example we take this simplified configuration which set a label and a color for a button

```json
"config": {
  "buttonLabel": {
    "it": {
      "buttonLabel": "Bottone"
    },
    "es": {
      "buttonLabel": "Botón"
    }
  },
  "buttonColor": "#ff0000"
}
```

As per the example the config property can contain a optional `locale` property that contains the language used by default in the configuration. If this property is not set the default app language is used.
To define the translations there is the specific `translations` object specified which translate only the translatable fields in some specific language. In this specific case the `buttonLabel`is translate in italian and spanish and the `buttonColor` property is not translated since does not depend on the language.

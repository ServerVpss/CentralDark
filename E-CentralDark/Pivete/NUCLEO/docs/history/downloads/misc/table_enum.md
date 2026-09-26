# OUTRO - table_enum.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\toml-0.9.12+spec-1.1.0\src\de\deserializer\table_enum.rs
**SHA:** cd969f58f3767b62
**Timestamp:** 2026-08-28T02:36:24.562581
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- "", // TODO: this should be the variant name

### Ouro Bruto (primeiros 5000 chars)
```
use crate::alloc_prelude::*;
use crate::de::DeArray;
use crate::de::DeValue;
use crate::de::Error;

/// Deserializes table values into enum variants.
pub(crate) struct TableEnumDeserializer<'i> {
    value: DeValue<'i>,
    span: core::ops::Range<usize>,
}

impl<'i> TableEnumDeserializer<'i> {
    pub(crate) fn new(value: DeValue<'i>, span: core::ops::Range<usize>) -> Self {
        TableEnumDeserializer { value, span }
    }
}

impl<'de> serde_core::de::VariantAccess<'de> for TableEnumDeserializer<'de> {
    type Error = Error;

    fn unit_variant(self) -> Result<(), Self::Error> {
        match self.value {
            DeValue::Array(values) => {
                if values.is_empty() {
                    Ok(())
                } else {
                    Err(Error::custom("expected empty array", Some(self.span)))
                }
            }
            DeValue::Table(values) => {
                if values.is_empty() {
                    Ok(())
                } else {
                    Err(Error::custom("expected empty table", Some(self.span)))
                }
            }
            e => Err(Error::custom(
                format!("expected table, found {}", e.type_str()),
                Some(self.span),
            )),
        }
    }

    fn newtype_variant_seed<T>(self, seed: T) -> Result<T::Value, Self::Error>
    where
        T: serde_core::de::DeserializeSeed<'de>,
    {
        seed.deserialize(super::ValueDeserializer::with_parts(self.value, self.span))
    }

    fn tuple_variant<V>(self, len: usize, visitor: V) -> Result<V::Value, Self::Error>
    where
        V: serde_core::de::Visitor<'de>,
    {
        match self.value {
            DeValue::Array(values) => {
                let values_span = self.span.clone();
                let tuple_values = values;

                if tuple_values.len() == len {
                    serde_core::de::Deserializer::deserialize_seq(
                        super::ArrayDeserializer::new(tuple_values, values_span),
                        visitor,
                    )
                } else {
                    Err(Error::custom(
                        format!("expected tuple with length {len}"),
                        Some(values_span),
                    ))
                }
            }
            DeValue::Table(values) => {
                let values_span = self.span.clone();
                let tuple_values: Result<DeArray<'_>, _> = values
                    .into_iter()
                    .enumerate()
                    .map(
                        |(index, (key, value))| match key.get_ref().parse::<usize>() {
                            Ok(key_index) if key_index == index => Ok(value),
                            Ok(_) | Err(_) => Err(Error::custom(
                                format!("expected table key `{index}`, but was `{key}`"),
                                Some(key.span()),
                            )),
                        },
                    )
                    .collect();
                let tuple_values = tuple_values?;

                if tuple_values.len() == len {
                    serde_core::de::Deserializer::deserialize_seq(
                        super::ArrayDeserializer::new(tuple_values, values_span),
                        visitor,
                    )
                } else {
                    Err(Error::custom(
                        format!("expected tuple with length {len}"),
                        Some(values_span),
                    ))
                }
            }
            e => Err(Error::custom(
                format!("expected table, found {}", e.type_str()),
                Some(self.span),
            )),
        }
    }

    fn struct_variant<V>(
        self,
        fields: &'static [&'static str],
        visitor: V,
    ) -> Result<V::Value, Self::Error>
    where
        V: serde_core::de::Visitor<'de>,
    {
        serde_core::de::Deserializer::deserialize_struct(
            super::ValueDeserializer::with_parts(self.value, self.span)
                .with_struct_key_validation(),
            "", // TODO: this should be the variant name
            fields,
            visitor,
        )
    }
}

```
# OUTRO - serialization_serde.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\winreg-0.55.0\src\encoder\serialization_serde.rs
**SHA:** 13dc5c55fd73ab89
**Timestamp:** 2026-08-28T02:37:41.791981
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Start => Err(EncoderError::NoFieldName),
- Start => Err(EncoderError::NoFieldName),
- Start => {

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2017, Igor Shaula
// Licensed under the MIT License <LICENSE or
// http://opensource.org/licenses/MIT>. This file
// may not be copied, modified, or distributed
// except according to those terms.
use super::EncoderState::*;
use super::{EncodeResult, Encoder, EncoderError, ENCODER_SAM};
use crate::enums::RegType;
use crate::transaction::Transaction;
use crate::RegValue;
use serde::ser::*;
use std::fmt;
use std::mem;

impl Error for EncoderError {
    fn custom<T: fmt::Display>(msg: T) -> Self {
        EncoderError::SerializerError(format!("{}", msg))
    }
}

impl<'a, Tr: AsRef<Transaction>> Serializer for &'a mut Encoder<Tr> {
    type Ok = ();
    type Error = EncoderError;

    type SerializeSeq = SeqEncoder;
    type SerializeTuple = TupleEncoder;
    type SerializeTupleStruct = TupleStructEncoder;
    type SerializeTupleVariant = TupleVariantEncoder;
    type SerializeMap = StructMapEncoder<'a, Tr>;
    type SerializeStruct = StructMapEncoder<'a, Tr>;
    type SerializeStructVariant = StructVariantEncoder;

    fn serialize_bool(self, value: bool) -> EncodeResult<Self::Ok> {
        self.serialize_u32(value as u32)
    }

    fn serialize_i8(self, value: i8) -> EncodeResult<Self::Ok> {
        self.serialize_i64(value as i64)
    }

    fn serialize_i16(self, value: i16) -> EncodeResult<Self::Ok> {
        self.serialize_i64(value as i64)
    }

    fn serialize_i32(self, value: i32) -> EncodeResult<Self::Ok> {
        self.serialize_i64(value as i64)
    }

    fn serialize_i64(self, value: i64) -> EncodeResult<Self::Ok> {
        let s = value.to_string();
        emit_value!(self, s)
    }

    fn serialize_u8(self, value: u8) -> EncodeResult<Self::Ok> {
        self.serialize_u32(value as u32)
    }

    fn serialize_u16(self, value: u16) -> EncodeResult<Self::Ok> {
        self.serialize_u32(value as u32)
    }

    fn serialize_u32(self, value: u32) -> EncodeResult<Self::Ok> {
        emit_value!(self, value)
    }

    fn serialize_u64(self, value: u64) -> EncodeResult<Self::Ok> {
        emit_value!(self, value)
    }

    fn serialize_f32(self, value: f32) -> EncodeResult<Self::Ok> {
        let s = value.to_string();
        emit_value!(self, s)
    }

    fn serialize_f64(self, value: f64) -> EncodeResult<Self::Ok> {
        let s = value.to_string();
        emit_value!(self, s)
    }

    fn serialize_char(self, value: char) -> EncodeResult<Self::Ok> {
        let mut s = String::new();
        s.push(value);
        emit_value!(self, s)
    }

    fn serialize_str(self, value: &str) -> EncodeResult<Self::Ok> {
        emit_value!(self, value)
    }

    fn serialize_bytes(self, value: &[u8]) -> EncodeResult<Self::Ok> {
        match mem::replace(&mut self.state, Start) {
            NextKey(ref s) => {
                let vec = Vec::from(value);
                self.keys[self.keys.len() - 1]
                    .set_raw_value(
                        s,
                        &RegValue {
                            bytes: vec,
                            vtype: RegType::REG_BINARY,
                        },
                    )
                    .map_err(EncoderError::IoError)
            }
            Start => Err(EncoderError::NoFieldName),
        }
    }

    fn serialize_none(self) -> EncodeResult<Self::Ok> {
        match mem::replace(&mut self.state, Start) {
            NextKey(..) => Ok(()),
            Start => Err(EncoderError::NoFieldName),
        }
    }

    fn serialize_some<T: ?Sized + Serialize>(self, value: &T) -> EncodeResult<Self::Ok> {
        value.serialize(self)
    }

    fn serialize_unit(self) -> EncodeResult<Self::Ok> {
        no_impl!("serialize_unit")
    }

    fn serialize_unit_struct(self, _name: &'static str) -> EncodeResult<Self::Ok> {
        no_impl!("serialize_unit_struct")
    }

    fn serialize_unit_variant(
        self,
        _name: &'static str,
        _variant_index: u32,
        _variant: &'static str,
    ) -> EncodeResult<Self::Ok> {
        no_impl!("serialize_unit_variant")
    }

    fn serialize_newtype_struct<T: ?Sized + Serialize>(
        self,
        _name: &'static str,
        _value: &T,
    ) -> EncodeResult<Self::Ok> {
        no_impl!("serialize_newtype_struct")
    }

    fn serialize_newtype_variant<T: ?Sized + Serialize>(
        self,
        _name: &'static str,
        _variant_index: u32,
        _variant: &'static str,
        _value: &T,
    ) -> EncodeResult<Self::Ok> {
        no_impl!("serialize_newtype_variant")
    }

    fn serialize_seq(self, _len: Option<usize>) -> EncodeResult<Self::SerializeSeq> {
        no_impl!("serialize_seq")
    }

    fn serialize_tuple(self, _len: usize) -> EncodeResult<Self::SerializeTuple> {
        no_impl!("serialize_tuple")
    }

    fn serialize_tuple_struct(
        self,
        _name: &'static str,
        _len: usize,
    ) -> EncodeResult<Self::SerializeTupleStruct> {
        no_impl!("serialize_tuple_struct")
    }

    fn serialize_tuple_variant(
```
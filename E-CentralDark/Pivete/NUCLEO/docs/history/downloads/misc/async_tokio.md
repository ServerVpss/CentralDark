# OUTRO - async_tokio.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\quick-xml-0.41.0\src\reader\async_tokio.rs
**SHA:** 29c9ea6b5b1c3b16
**Timestamp:** 2026-08-28T02:35:01.349486
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = buf.remaining();
- /// let start = BytesStart::new("outer");
- /// let start = BytesStart::new("html");
- let start = buf.len();
- /// let start = BytesStart::from_content(r#"outer xmlns="namespace 1""#, 5);
- /// let start = BytesStart::new("html");

### Ouro Bruto (primeiros 5000 chars)
```
//! This is an implementation of [`Reader`] for reading from a [`AsyncBufRead`]
//! as underlying byte stream. This reader fully implements async/await so reading
//! can use non-blocking I/O.

use std::pin::Pin;
use std::task::{Context, Poll};

use tokio::io::{self, AsyncBufRead, AsyncBufReadExt, AsyncRead, ReadBuf};

use crate::encoding;
use crate::errors::{Error, IllFormedError, Result, SyntaxError};
use crate::events::{BytesRef, BytesText, Event};
use crate::name::{QName, ResolveResult};
use crate::parser::{ElementParser, Parser, PiParser};
use crate::reader::buffered_reader::impl_buffered_source;
use crate::reader::{
    BangType, BinaryStream, NsReader, ParseState, ReadRefResult, ReadTextResult, Reader, Span,
};
use crate::utils::is_whitespace;

/// A struct for read XML asynchronously from an [`AsyncBufRead`].
///
/// Having own struct allows us to implement anything without risk of name conflicts
/// and does not suffer from the impossibility of having `async` in traits.
struct TokioAdapter<'a, R>(&'a mut R);

impl<'a, R: AsyncBufRead + Unpin> TokioAdapter<'a, R> {
    impl_buffered_source!('b, 0, async, await);
}

////////////////////////////////////////////////////////////////////////////////////////////////////

impl<'r, R> AsyncRead for BinaryStream<'r, R>
where
    R: AsyncRead + Unpin,
{
    fn poll_read(
        self: Pin<&mut Self>,
        cx: &mut Context<'_>,
        buf: &mut ReadBuf<'_>,
    ) -> Poll<io::Result<()>> {
        let start = buf.remaining();
        let this = self.get_mut();
        let poll = Pin::new(&mut *this.inner).poll_read(cx, buf);

        // If something was read, update offset
        if let Poll::Ready(Ok(_)) = poll {
            let amt = start - buf.remaining();
            *this.offset += amt as u64;
        }
        poll
    }
}

impl<'r, R> AsyncBufRead for BinaryStream<'r, R>
where
    R: AsyncBufRead + Unpin,
{
    #[inline]
    fn poll_fill_buf(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<io::Result<&[u8]>> {
        Pin::new(&mut *self.get_mut().inner).poll_fill_buf(cx)
    }

    #[inline]
    fn consume(self: Pin<&mut Self>, amt: usize) {
        let this = self.get_mut();
        this.inner.consume(amt);
        *this.offset += amt as u64;
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////

impl<R: AsyncBufRead + Unpin> Reader<R> {
    /// An asynchronous version of [`read_event_into()`]. Reads the next event into
    /// given buffer.
    ///
    /// This is the main entry point for reading XML `Event`s when using an async reader.
    ///
    /// See the documentation of [`read_event_into()`] for more information.
    ///
    /// # Examples
    ///
    /// ```
    /// # tokio_test::block_on(async {
    /// # use pretty_assertions::assert_eq;
    /// use quick_xml::events::Event;
    /// use quick_xml::reader::Reader;
    ///
    /// // This explicitly uses `from_reader("...".as_bytes())` to use a buffered
    /// // reader instead of relying on the zero-copy optimizations for reading
    /// // from byte slices, which provides the sync interface anyway.
    /// let mut reader = Reader::from_reader(r#"
    ///     <tag1 att1 = "test">
    ///        <tag2><!--Test comment-->Test</tag2>
    ///        <tag2>Test 2</tag2>
    ///     </tag1>
    /// "#.as_bytes());
    /// reader.config_mut().trim_text(true);
    ///
    /// let mut count = 0;
    /// let mut buf = Vec::new();
    /// let mut txt = Vec::new();
    /// loop {
    ///     match reader.read_event_into_async(&mut buf).await {
    ///         Ok(Event::Start(_)) => count += 1,
    ///         Ok(Event::Text(e)) => txt.push(e.decode().unwrap().into_owned()),
    ///         Err(e) => panic!("Error at position {}: {:?}", reader.error_position(), e),
    ///         Ok(Event::Eof) => break,
    ///         _ => (),
    ///     }
    ///     buf.clear();
    /// }
    /// assert_eq!(count, 3);
    /// assert_eq!(txt, vec!["Test".to_string(), "Test 2".to_string()]);
    /// # }) // tokio_test::block_on
    /// ```
    ///
    /// [`read_event_into()`]: Reader::read_event_into
    pub async fn read_event_into_async<'b>(
        &mut self,
        mut buf: &'b mut Vec<u8>,
    ) -> Result<Event<'b>> {
        read_event_impl!(
            self,
            buf,
            TokioAdapter(&mut self.reader),
            read_until_close_async,
            await
        )
    }

    /// An asynchronous version of [`read_to_end_into()`].
    /// Reads asynchronously until end element is found using provided buffer as
    /// intermediate storage for events content. This function is supposed to be
    /// called after you already read a [`Start`] event.
    ///
    /// See the documentation of [`read_to_end_into()`] for more information.
    ///
    /// # Examples
    ///
    /// This example shows, how you can skip XML content after you read the
    /// start event.
    ///
    /// ```
    /// # tokio_test::block_on(async {
    /// # u
```

---

# OUTRO - async_tokio.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\quick-xml-0.41.0\src\writer\async_tokio.rs
**SHA:** b75a2c257f9be9d6
**Timestamp:** 2026-08-28T02:35:01.648918
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- test!(empty_tag, Event::Empty(BytesStart::new("tag")), r#"<tag/>"#);
- let start = Event::Start(BytesStart::new("tag"));
- let tag = BytesStart::new("self-closed")
- let start = BytesStart::new("paired")
- let start = BytesStart::new("paired")
- let inner = BytesStart::new("inner");
- let start = BytesStart::new("paired")
- let start = BytesStart::new("paired")
- let inner = BytesStart::new("inner");
- let start = BytesStart::new("paired")

### Ouro Bruto (primeiros 5000 chars)
```
use std::future::Future;
use std::result::Result as StdResult;

use tokio::io::{AsyncWrite, AsyncWriteExt};

use crate::errors::{Error, Result};
use crate::events::{BytesCData, BytesPI, BytesText, Event};
use crate::{ElementWriter, Writer};

impl<W: AsyncWrite + Unpin> Writer<W> {
    /// Writes the given event to the underlying writer. Async version of [`Writer::write_event`].
    pub async fn write_event_async<'a, E: Into<Event<'a>>>(&mut self, event: E) -> Result<()> {
        let mut next_should_line_break = true;
        let result = match event.into() {
            Event::Start(e) => {
                let result = self.write_wrapped_async(b"<", &e, b">").await;
                if let Some(i) = self.indent.as_mut() {
                    i.grow();
                }
                result
            }
            Event::End(e) => {
                if let Some(i) = self.indent.as_mut() {
                    i.shrink();
                }
                self.write_wrapped_async(b"</", &e, b">").await
            }
            Event::Empty(e) => self.write_wrapped_async(b"<", &e, b"/>").await,
            Event::Text(e) => {
                next_should_line_break = false;
                self.write_async(&e).await
            }
            Event::Comment(e) => self.write_wrapped_async(b"<!--", &e, b"-->").await,
            Event::CData(e) => {
                next_should_line_break = false;
                self.write_async(b"<![CDATA[").await?;
                self.write_async(&e).await?;
                self.write_async(b"]]>").await
            }
            Event::Decl(e) => self.write_wrapped_async(b"<?", &e, b"?>").await,
            Event::PI(e) => self.write_wrapped_async(b"<?", &e, b"?>").await,
            Event::DocType(e) => self.write_wrapped_async(b"<!DOCTYPE ", &e, b">").await,
            Event::GeneralRef(e) => self.write_wrapped_async(b"&", &e, b";").await,
            Event::Eof => Ok(()),
        };
        if let Some(i) = self.indent.as_mut() {
            i.should_line_break = next_should_line_break;
        }
        result
    }

    /// Manually write a newline and indentation at the proper level. Async version of
    /// [`Writer::write_indent`].
    ///
    /// This method will do nothing if `Writer` was not constructed with [`Writer::new_with_indent`].
    pub async fn write_indent_async(&mut self) -> Result<()> {
        if let Some(ref i) = self.indent {
            self.writer.write_all(b"\n").await?;
            self.writer.write_all(i.current()).await?;
        }
        Ok(())
    }

    #[inline]
    async fn write_async(&mut self, value: &[u8]) -> Result<()> {
        self.writer.write_all(value).await.map_err(Into::into)
    }

    #[inline]
    async fn write_wrapped_async(
        &mut self,
        before: &[u8],
        value: &[u8],
        after: &[u8],
    ) -> Result<()> {
        if let Some(ref i) = self.indent {
            if i.should_line_break {
                self.writer.write_all(b"\n").await?;
                self.writer.write_all(i.current()).await?;
            }
        }
        self.write_async(before).await?;
        self.write_async(value).await?;
        self.write_async(after).await?;
        Ok(())
    }
}

impl<'a, W: AsyncWrite + Unpin> ElementWriter<'a, W> {
    /// Write some text inside the current element.
    ///
    /// # Example
    ///
    /// ```
    /// # use quick_xml::writer::Writer;
    /// # use quick_xml::events::BytesText;
    /// # use tokio::io::AsyncWriteExt;
    /// # #[tokio::main(flavor = "current_thread")] async fn main() {
    /// let mut buffer = Vec::new();
    /// let mut tokio_buffer = tokio::io::BufWriter::new(&mut buffer);
    /// let mut writer = Writer::new_with_indent(&mut tokio_buffer, b' ', 4);
    ///
    /// writer
    ///     .create_element("paired")
    ///     .with_attribute(("attr1", "value1"))
    ///     .with_attribute(("attr2", "value2"))
    ///     .write_text_content_async(BytesText::new("text"))
    ///     .await
    ///     .expect("cannot write content");
    ///
    /// tokio_buffer.flush().await.expect("flush failed");
    ///
    /// assert_eq!(
    ///     std::str::from_utf8(&buffer).unwrap(),
    ///     r#"<paired attr1="value1" attr2="value2">text</paired>"#
    /// );
    /// # }
    pub async fn write_text_content_async(self, text: BytesText<'_>) -> Result<&'a mut Writer<W>> {
        self.writer
            .write_event_async(Event::Start(self.start_tag.borrow()))
            .await?;
        self.writer.write_event_async(Event::Text(text)).await?;
        self.writer
            .write_event_async(Event::End(self.start_tag.to_end()))
            .await?;
        Ok(self.writer)
    }

    /// Write a CData event `<![CDATA[...]]>` inside the current element.
    ///
    /// # Example
    ///
    /// ```
    /// # use quick_xml::writer::Writer;
    /// # use quick_xml::events::BytesCData;
    /// # use tokio::io::AsyncWriteExt;
    /// # #[tokio::main(flavor = "current_thread"
```
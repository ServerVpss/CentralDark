# MISSAO - AsmExtensions.kt
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\kotlin-dsl\org\gradle\kotlin\dsl\support\bytecode\AsmExtensions.kt
**SHA:** 6329fa528c032373
**Timestamp:** 2026-08-28T02:50:38.462594
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- val tryBlockStart = Label()
- val catchBlockStart = Label()

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2018 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

@file:Suppress("FunctionNaming", "FunctionParameterNaming")

package org.gradle.kotlin.dsl.support.bytecode

import org.jetbrains.org.objectweb.asm.ClassVisitor
import org.jetbrains.org.objectweb.asm.ClassWriter
import org.jetbrains.org.objectweb.asm.Label
import org.jetbrains.org.objectweb.asm.MethodVisitor
import org.jetbrains.org.objectweb.asm.Opcodes
import org.jetbrains.org.objectweb.asm.Opcodes.T_BYTE
import org.jetbrains.org.objectweb.asm.Type

import kotlin.jvm.internal.CallableReference
import kotlin.reflect.KClass
import kotlin.reflect.KProperty


internal
fun publicClass(
    name: InternalName,
    superName: InternalName? = null,
    interfaces: List<InternalName>? = null,
    classBody: ClassWriter.() -> Unit = {}
) = beginPublicClass(name, superName, interfaces).run {
    classBody()
    endClass()
}


internal
fun beginPublicClass(name: InternalName, superName: InternalName? = null, interfaces: List<InternalName>? = null) =
    beginClass(Opcodes.ACC_PUBLIC + Opcodes.ACC_FINAL, name, superName, interfaces)


internal
fun beginClass(
    modifiers: Int,
    name: InternalName,
    superName: InternalName? = null,
    interfaces: List<InternalName>? = null
): ClassWriter = ClassWriter(ClassWriter.COMPUTE_MAXS + ClassWriter.COMPUTE_FRAMES).apply {
    visit(
        GradleJvmVersion.minimalAsmClassVersion,
        modifiers,
        name.value,
        null,
        (superName ?: InternalNameOf.javaLangObject).value,
        interfaces?.map { it.value }?.toTypedArray()
    )
}


internal
fun ClassWriter.endClass(): ByteArray {
    visitEnd()
    return toByteArray()
}


internal
fun ClassWriter.publicDefaultConstructor(superName: InternalName = InternalNameOf.javaLangObject) {
    publicMethod("<init>", "()V") {
        ALOAD(0)
        INVOKESPECIAL(superName, "<init>", "()V")
        RETURN()
    }
}


internal
fun ClassVisitor.publicStaticMethod(
    name: String,
    desc: String,
    signature: String? = null,
    exceptions: Array<String>? = null,
    deprecated: Boolean = false,
    methodBody: MethodVisitor.() -> Unit,
    annotations: MethodVisitor.() -> Unit
) {
    method(
        Opcodes.ACC_PUBLIC + Opcodes.ACC_STATIC + if (deprecated) {
            Opcodes.ACC_DEPRECATED
        } else {
            0
        },
        name, desc, signature, exceptions, annotations, methodBody
    )
}


internal
fun ClassVisitor.publicMethod(
    name: String,
    desc: String,
    signature: String? = null,
    exceptions: Array<String>? = null,
    annotations: MethodVisitor.() -> Unit = {},
    methodBody: MethodVisitor.() -> Unit
) {
    method(Opcodes.ACC_PUBLIC, name, desc, signature, exceptions, annotations, methodBody)
}


internal
fun ClassVisitor.method(
    access: Int,
    name: String,
    desc: String,
    signature: String? = null,
    exceptions: Array<String>? = null,
    annotations: MethodVisitor.() -> Unit = {},
    methodBody: MethodVisitor.() -> Unit
) {
    visitMethod(access, name, desc, signature, exceptions).apply {
        annotations()
        visitCode()
        methodBody()
        visitMaxs(0, 0)
        visitEnd()
    }
}


internal
fun MethodVisitor.loadByteArray(byteArray: ByteArray) {
    LDC(byteArray.size)
    NEWARRAY(T_BYTE)
    for ((i, byte) in byteArray.withIndex()) {
        DUP()
        LDC(i)
        LDC(byte)
        BASTORE()
    }
}


internal
fun MethodVisitor.ICONST_0() {
    visitInsn(Opcodes.ICONST_0)
}


internal
fun MethodVisitor.NEW(type: InternalName) {
    visitTypeInsn(Opcodes.NEW, type)
}


internal
fun MethodVisitor.visitTypeInsn(opcode: Int, type: InternalName) {
    visitTypeInsn(opcode, type.value)
}


internal
fun MethodVisitor.NEWARRAY(primitiveType: Int) {
    visitIntInsn(Opcodes.NEWARRAY, primitiveType)
}


internal
fun MethodVisitor.LDC(type: InternalName) {
    visitLdcInsn(Type.getType("L${type.value};"))
}


internal
fun MethodVisitor.LDC(value: Any) {
    visitLdcInsn(value)
}


internal
fun MethodVisitor.INVOKEVIRTUAL(owner: InternalName, name: String, desc: String, itf: Boolean = false) {
    visitMethodInsn_(Opcodes.INVOKEVIRTUAL, owner, name, desc, itf)
}


internal
fun MethodVisitor.INVOKESPECIAL(owner: InternalName, name: String, desc: String, itf: Boolean = false) {
    visitMethodInsn_(Opcodes.INVOKESPECIAL, owner, name, desc, itf)
}


internal
fun MethodVisitor.INVOKEINTERFACE(owner: InternalName, name: String
```
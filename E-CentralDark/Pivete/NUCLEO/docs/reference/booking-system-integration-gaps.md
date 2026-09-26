# REFERENCIA - booking-system-integration-gaps.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\wix\skills\wix-manage\references\bookings\booking-system-integration-gaps.md
**SHA:** c4a83f6f3eaacf02
**Timestamp:** 2026-08-26T18:42:42.863884
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - Sequential service timing coordination (second service start = first service end)

### Ouro Bruto (primeiros 5000 chars)
```
---
name: "Booking System Integration Gaps"
description: Documents undocumented API patterns for booking payments. Covers Bookings→Ecommerce integration, booking ID transformation to catalog items, and async payment confirmation flows.
---
# Technical Step-by-Step Instructions: Wix Bookings System Integration Gaps - Complete API Documentation Analysis

## Description

This recipe addresses **critical undocumented API patterns and business integration gaps** across the entire Wix Bookings ecosystem. While Wix extensively documents individual booking creation APIs, there exist fundamental undocumented integration patterns that are essential for any payment-enabled booking business but completely absent from all official documentation sources.


---

## Prerequisites

### Required App Installations

Before implementing any booking integration, ensure the following requirements are met:

1. **Wix Bookings** - Core app must be installed and configured
2. **Wix Ecommerce** - Required for payment processing (undocumented dependency)
3. **Services Created** - At least one bookable service must exist on the site
4. **Staff Resources** - Staff members must be available for service delivery
5. **Business Schedule** - Operating hours must be configured

### App Installation Process

If you encounter service-related errors, install the required apps using the Apps Installer API.

**For detailed app installation procedures, refer to:**
- [Apps Installer API Documentation](https://dev.wix.com/docs/api-reference/business-management/app-installation/install-app)
- Business setup recipes for comprehensive app installation workflows

## Overview

The Wix Bookings system contains **fundamental undocumented integration patterns** that affect every booking scenario requiring payment processing. These gaps create confusion and implementation barriers across all booking types:

- **Single Appointment Bookings**: How booking payments actually work
- **Class Bookings**: Payment processing for group services
- **Course Bookings**: Complex dual-API requirements for scheduling
- **Multi-Service Packages**: Completely undocumented unified booking endpoint

### CRITICAL API DOCUMENTATION GAPS

**The Universal Undocumented Pattern**: **Bookings→Ecommerce Integration Architecture**

**Documentation Status Across ALL Booking Types**:
- ❌ **NOT** documented how booking IDs become catalog items
- ❌ **NOT** documented that ecom system handles all pricing/tax calculations
- ❌ **NOT** documented async payment confirmation patterns
- ❌ **NOT** documented booking status vs order status separation
- ❌ **NOT** documented service properties preservation in checkout
- ❌ **NO** mention of `BACKOFFICE_MERCHANT` channel requirement
- ❌ **NO** explanation of why checkout/order APIs are needed for bookings

**Additional Service-Specific Gaps**:
- ❌ **Courses**: Dual API requirement (booking + calendar events) completely undocumented
- ❌ **Multi-Service**: Entire endpoint missing from all documentation
- ❌ **Payment Flow**: Universal integration pattern affects all booking types

### Key Discovery: Universal Architecture Gap

**What Developers Expect** (Based on Documentation):
- Create booking → Booking system handles payment → Done
- Payment status managed within booking system
- Booking APIs contain all necessary functionality

**Actual Undocumented Architecture**:
- Create booking → Booking system creates reservation only
- Use booking ID as catalog item in ecom system
- Ecom system handles all pricing, tax, discount calculations
- Create checkout and order for actual payment processing
- Async messaging system handles payment confirmation
- Booking status (CONFIRMED) independent of payment status

**Reality Check**:
```
Standard Documentation Shows: Booking API → Payment ✓
Actual Required Flow: Booking API → Ecom Integration → Payment ✓
```

### Business Impact of These Gaps

**Without Understanding Universal Integration Patterns:**
- Developers assume booking creation includes payment processing
- No knowledge that ecom system handles all financial calculations
- Missing understanding of async payment confirmation architecture
- Confusion about booking status vs payment status separation
- Unknown relationship between booking system and ecommerce system

**Without Service-Specific Knowledge:**
- Course businesses cannot create functioning course delivery schedules
- Package-based businesses cannot create unified booking experiences
- Payment implementation becomes trial-and-error process
- Integration projects fail due to missing critical steps

**Current Developer Confusion Patterns:**
- "Why do I need ecommerce APIs for booking payments?"
- "How do booking payments actually work?"
- "Why are my course bookings invisible on the calendar?"
- "How do I create spa day packages?"
- "What's the difference between booking status and payment status?"

### IMPORTANT NOTES

* **Universal Integration Gap**: Every booking requiring payment uses undocumented eco
```
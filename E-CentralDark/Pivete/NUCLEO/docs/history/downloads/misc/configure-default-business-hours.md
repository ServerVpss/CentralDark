# OUTRO - configure-default-business-hours.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\wix\skills\wix-manage\references\calendar\configure-default-business-hours.md
**SHA:** 7835157089b959fe
**Timestamp:** 2026-08-26T18:45:29.910858
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- Query pattern:
- Use `bulkUpdateEvents` API ([REST](https://dev.wix.com/docs/api-reference/business-management/calendar/events-v3/bulk-update-event)) with `fieldmask` pattern:

### Ouro Bruto (primeiros 5000 chars)
```
---
name: "Configure Default Business Hours"
description: Uses Calendar Events API to create WORKING_HOURS events on the business schedule. Covers the critical distinction between Calendar Events API (correct) vs Site Properties API (incorrect) for setting base availability.
---
# Technical Step-by-Step Instructions: Setting Up Wix Bookings Default Business Hours (Real-World, API-First)

## Description

Below are the recommended steps to successfully configure default business hours for Wix Bookings, which control the base availability shown in the "Set default hours" dashboard. This recipe covers the correct API usage, common pitfalls, and cleanup procedures for managing business schedule events.

---

## Prerequisites

- **Wix Bookings app installed** (App ID: `13d21c63-b5ec-5912-8397-c3a5ddb27a97`)

> **Note:** If you receive errors from Bookings APIs, the Wix Bookings app may not be installed on the site. Use [List Installed Apps](../app-installation/list-installed-apps.md) to verify, and [Install Wix Apps](../app-installation/install-wix-apps.md) to install it if missing.

## Overview

Wix Bookings default business hours define the base availability for your booking system and appear in the Bookings dashboard under "Set default hours". These hours:

- **Control base availability**: Set when your business is generally available for bookings
- **Apply to new staff**: Default working hours that new staff members inherit
- **Display in dashboard**: Show as time slots in the "Set default hours" interface

### 🚨 CRITICAL: Default Hours Upon Installation

**IMPORTANT**: When Wix Bookings is first installed on a site, it automatically creates DEFAULT business hours (typically 9 AM - 5 PM, Monday through Friday). You CANNOT simply create new hours without handling these existing default hours first.

**You MUST either:**
1. **Update the existing default hours** to your desired schedule, OR
2. **Delete the existing default hours** and create new ones

**Failure to handle existing hours will result in:**
- Duplicate time slots in the dashboard
- Conflicting availability schedules
- Unexpected booking behavior

### CRITICAL API DISCOVERY

**❌ WRONG API**: Site Properties API (`/site-properties/v4/properties/business-schedule`)
- This sets general site business schedule, NOT Bookings default hours

**✅ CORRECT API**: Calendar Events V3 API (`/calendar/v3/events`)
- Creates `WORKING_HOURS` events on the business schedule
- Each `MASTER` event creates one time slot in the dashboard
- Uses fixed business resource ID: `4e0579a5-491e-4e70-a872-d097eed6e520`

### Key Discovery: Universal Business Schedule External ID

**VERIFIED**: The business schedule external ID `"4e0579a5-491e-4e70-a872-d097eed6e520"` is **universal across all Wix sites**.

This has been tested and confirmed on multiple different Wix sites:
- All sites have a business schedule with this exact external ID
- The schedule name is consistently `"business"`
- While the internal schedule `id` varies per site, the `externalId` is constant
- This makes the recipe reliable without requiring site-specific discovery

### IMPORTANT NOTES

* **Universal External ID**: The business schedule external ID `"4e0579a5-491e-4e70-a872-d097eed6e520"` is verified to work across all Wix sites
* **Default Hours Always Exist**: Every Wix Bookings installation creates default hours automatically
* **Event Scheduling Flexibility**: Businesses can create multiple time slots per day or complex schedules as needed - there are no restrictions on number of events per day
* **MASTER vs INSTANCE Events**: Based on observed behavior, MASTER events appear to generate INSTANCE events automatically, but always verify current event state when working with recurring events
* **Query Patterns**: Use `"recurrenceType": ["MASTER"]` to focus on the primary recurring event definitions
* **Revision Numbers**: Calendar events require current revision numbers for updates - always get fresh revision before bulk operations

---

## Steps

### 1. Find Business Schedule

Query the business schedule that controls default hours using the fixed external ID.

**Endpoint**: `POST https://www.wixapis.com/calendar/v3/schedules/query`

Use `querySchedules` API ([REST](https://dev.wix.com/docs/api-reference/business-management/calendar/schedules-v3/query-schedules)) with filter:
- `externalId`: `"4e0579a5-491e-4e70-a872-d097eed6e520"`

Keep the returned `schedule.id` for creating events.

### 2. Query Existing Working Hours (MANDATORY)

**🚨 CRITICAL STEP**: You MUST query for existing `WORKING_HOURS` events because Wix Bookings automatically creates default hours upon installation.

**Endpoint**: `POST https://www.wixapis.com/calendar/v3/events/query`

Use `queryEvents` API ([REST](https://dev.wix.com/docs/api-reference/business-management/calendar/events-v3/query-events)):

Query pattern:
```json
{
    "recurrenceType": ["MASTER"],
    "query": {
        "filter": {
            "scheduleId": "business-schedule
```
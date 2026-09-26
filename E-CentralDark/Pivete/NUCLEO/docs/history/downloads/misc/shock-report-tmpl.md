# OUTRO - shock-report-tmpl.html
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\product\templates\shock-report-tmpl.html
**SHA:** f6b3984683b9c0e2
**Timestamp:** 2026-08-28T02:02:21.404691
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- gap: 20px;
- gap: 15px;
- gap: 30px;
- gap: 20px;
- gap: 10px;

### Ouro Bruto (primeiros 5000 chars)
```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Design System Shock Report - {{PROJECT_NAME}}</title>
    <style>
        /* Self-contained CSS - zero external dependencies */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background: #f5f5f5;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            color: #dc2626;
        }

        h2 {
            font-size: 1.8rem;
            margin: 40px 0 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #dc2626;
        }

        h3 {
            font-size: 1.3rem;
            margin: 30px 0 15px;
            color: #374151;
        }

        .subtitle {
            font-size: 1.2rem;
            color: #6b7280;
            margin-bottom: 30px;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }

        .stat-card {
            padding: 20px;
            background: #fef2f2;
            border-left: 4px solid #dc2626;
            border-radius: 4px;
        }

        .stat-card.good {
            background: #f0fdf4;
            border-left-color: #16a34a;
        }

        .stat-label {
            font-size: 0.9rem;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .stat-value {
            font-size: 2.5rem;
            font-weight: bold;
            color: #dc2626;
            margin: 10px 0;
        }

        .stat-card.good .stat-value {
            color: #16a34a;
        }

        .stat-detail {
            font-size: 0.95rem;
            color: #4b5563;
        }

        .horror-show {
            background: #fef2f2;
            padding: 30px;
            border-radius: 8px;
            margin: 30px 0;
        }

        .pattern-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }

        .pattern-item {
            padding: 15px;
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 4px;
            text-align: center;
            font-size: 0.85rem;
        }

        .pattern-preview {
            width: 100%;
            height: 40px;
            margin-bottom: 10px;
            border-radius: 4px;
        }

        .consolidation-preview {
            background: #f0fdf4;
            padding: 30px;
            border-radius: 8px;
            margin: 30px 0;
        }

        .comparison {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 30px;
            margin: 20px 0;
            font-size: 1.5rem;
        }

        .comparison .before {
            color: #dc2626;
            font-weight: bold;
        }

        .comparison .after {
            color: #16a34a;
            font-weight: bold;
        }

        .comparison .arrow {
            font-size: 2rem;
            color: #6b7280;
        }

        .roi-calculator {
            background: #eff6ff;
            padding: 30px;
            border-radius: 8px;
            margin: 30px 0;
        }

        .cost-row {
            display: flex;
            justify-content: space-between;
            padding: 15px;
            border-bottom: 1px solid #e5e7eb;
        }

        .cost-row:last-child {
            border-bottom: none;
            font-weight: bold;
            font-size: 1.2rem;
        }

        .cost-label {
            color: #4b5563;
        }

        .cost-value {
            color: #1e40af;
            font-weight: 600;
        }

        .cost-row:last-child .cost-value {
            color: #16a34a;
            font-size: 1.5rem;
        }

        .timeline {
            margin: 30px 0;
        }

        .timeline-item {
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
        }

        .timeline-marker {
            flex-shrink: 0;
            width: 40px;
            height: 40px;
            background: #dc2626;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }

 
```
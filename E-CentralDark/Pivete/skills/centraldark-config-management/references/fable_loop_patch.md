# Example patch for FABLE_LOOP

```yaml
--- a/docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml
+++ b/docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml
@@
   FABLE_LOOP:
-    mode: READ_ONLY
-    default_routing: false
+    mode: READ_ONLY_CALIBRATION
+    default_routing: true
+    may_write_canonical: false
 ```
```
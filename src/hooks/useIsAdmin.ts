import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (!cancel) {
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      if (!cancel) {
        setIsAdmin(!error && !!data);
        setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  return { isAdmin, loading };
}

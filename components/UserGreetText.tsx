
"use client";
import { createClient } from "@/utils/supabase/client";
import React, { useEffect, useState } from "react";

const UserGreetText = () => {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);
  if (user !== null) {
    console.log(user);
    return (
      <p
        className="fixed left-0 top-0 flex w-full justify-center border-b border-green-400 bg-gradient-to-b from-green-400 pb-6 pt-8 
        backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-green-500 lg:p-4 lg:dark:bg-zinc-800/30"
      >
        Welcome,&nbsp;
        <code className="font-mono font-bold">{user.user_metadata.full_name ?? "user"}!</code>
      </p>
    );
  }
  return (
    <p
      className="fixed left-0 top-0 flex w-full justify-center border-b border-green-400 bg-gradient-to-b from-green-400 pb-6 pt-8 backdrop-blur-2xl 
    dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-green-500 lg:p-4 lg:dark:bg-zinc-800/30"
    >
      Welcome to &nbsp;
      <code className="font-mono font-bold">Mixify</code>
    </p>
  );
};

export default UserGreetText;
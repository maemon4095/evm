import { args_from } from "./args.ts";

const args = args_from(Deno.args);


const worker = new Worker(new URL("./aaa.ts", import.meta.url), {
  type: "module",
  deno: {
    permissions: {
      net: [],
      run: ["./lib/*"]
    }
  }
});


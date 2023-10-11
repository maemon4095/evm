import { parse_args } from "./args.ts";

console.log(Deno.args);
//const args = args_from(Deno.args);


const worker = new Worker(new URL("./aaa.ts", import.meta.url), {
  type: "module",
  deno: {
    permissions: {
      net: [],
      run: ["./lib/*"]
    }
  }
});


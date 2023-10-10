// syntax ::= "env" ("win32" | "macos"))
//          | "plugin"

function repeat(a: any): any {

};

function flag(): any {

}
const syntax = {
  "env": ["win32", "macos"],
  "plugin": repeat({
    "--dev": flag()
  })
};

const worker = new Worker(new URL("./aaa.ts", import.meta.url), {
  type: "module",
  deno: {
    permissions: {
      net: [],
      run: ["./lib/*"]
    }
  }
});


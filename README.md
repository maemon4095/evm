Executable Version Manager

# How works

`evm install ${executable name} ${version}`でglobalにapplicationがインストールされる．
アプリケーションによってはインストーラとかを動かさなければならないし，ダウンロードだけでいいかもしれない．
その辺はいじれる様にしたいし，nodeの様にアプリケーション様のプラグインが出来たらいいかも．

プラグインにはdenoを使おうかな？ `evm plugin ${url}` でプラグインファイルのインポートとする．
そもそもDenoで作ればいいかも．


`evm install`で以下の様なglobalな箇所にインストールされる．

`C:\Program Files\evm\installeds\the_application\v0.0.0`

`evm use ${name}`したとき,pathが通されている場所に`${name}`という名前のshell scriptが作成される．

`--global`フラグでglobalにしてもいいかも．
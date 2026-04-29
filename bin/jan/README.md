# Aion Jan Engine

This folder is where Aion OS looks for an embedded Jan CLI binary.

Expected binary:

```text
bin/jan/jan.exe
```

The official Jan Windows installer has been downloaded to:

```text
bin/jan/downloads/
```

Install Jan Desktop, launch it once, then use the Aion Jan Engine panel's
`Sync CLI` button. Aion will copy the installed Jan CLI into this folder and
serve models through `127.0.0.1:6767/v1`.

Jan CLI reference:

```text
jan models list
jan serve <MODEL_ID> --fit --detach
```

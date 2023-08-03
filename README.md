# @kessler/csv-splitter

A tool for splitting csv files.

Can be used from command line or programmatically.

Each page will end with two newlines. For a csv with headers, each page will begin with the headers.

## cli install

```
  npm i -g @kessler/csv-splitter
```

## cli usage

### csv with headers

split 4 rows into pages of 2 rows
```
  $ echo id,name\n1,foo\n2,bar\n3,blip\n4,blamp | node index.mjs -s 2
  id,name
  1,foo
  2,bar

  id,name
  3,blip
  4,blamp
```
### csv without headers

split 4 rows into pages of 2 rows
```
  $ echo 1,foo\n2,bar\n3,blip\n4,blamp | node index.mjs -s 2 --noHeaders
  1,foo
  2,bar

  3,blip
  4,blamp⏎
```

## module install
```
  npm i @kessler/csv-splitter
```

## module usage

```js
  import csvSplit from '@kessler/csv-splitter'

  async function main() {
    await csvSplit(process.stdin, process.stdout, { size: 100 })
  }

  main()
```


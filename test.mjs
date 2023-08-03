import test from 'ava'
import { exec } from 'child_process'
import csvSplit from './index.mjs'
import { Readable } from 'node:stream'

test('csv-splitter with headers', async t => {
  const { stdout } = await execCommand('echo \'id,name\n1,foo\n2,bar\n3,blip\n4,blamp\' | node index.mjs -s 2')
  t.is(stdout, 'id,name\n1,foo\n2,bar\n\nid,name\n3,blip\n4,blamp')
})

test('csv-splitter no headers', async t => {
  const { stdout } = await execCommand('echo \'1,foo\n2,bar\n3,blip\n4,blamp\' | node index.mjs -s 2 --noHeaders')
  t.is(stdout, '1,foo\n2,bar\n\n3,blip\n4,blamp')
})

test('use as module', async t => {
  const data = 'id,name\n1,foo\n2,bar\n3,blip\n4,blamp'
  const result = []
  const sink = async function (stream) {
    for await (const chunk of stream) {
      result.push(chunk.toString('utf8'))
    }
  }

  await csvSplit(Readable.from(data), sink, { size: 2 })
  t.is(result.join(''), `id,name
1,foo
2,bar

id,name
3,blip
4,blamp`)
})

async function execCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err) {
        reject(err)
      } else {
        resolve({ stdout, stderr })
      }
    })
  })
}
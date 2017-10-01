#!/usr/bin/env node
const {exec} = require('mz/child_process')
const [command] = process.argv.slice(2)

async function getBitbucketRemote() {
  const output = await exec('git remote -v')
  const lines = output[0].trim().split('\n')
  for(line of lines) {
    const [, bitbucketRepository] = line.match(/git@bitbucket.org:(.*\/.*).git/)
    if(bitbucketRepository) {
      return bitbucketRepository
    }
  }
}

async function open(url) {
  await exec(`open ${url}`)
}

function getBitbucketUrl(path) {
  return `https://bitbucket.org/${path}`
}

async function run() {
  try {
    const repository = await getBitbucketRemote()
    const repositoryUrl = getBitbucketUrl(repository)
    
    if(command === 'pipelines') {
      return await open(`${repositoryUrl}/addon/pipelines/home`)
    }

    if(command === 'pr') {
      return await open(`${repositoryUrl}/pull-requests`)
    }

    if(!command || command === 'browse') {
      return await open(repositoryUrl)
    }

    console.log('No such command!')

  } catch (err) {
    if(err.message.indexOf(`fatal: No such remote 'origin'`) !== -1) {
      console.error(`Remote 'origin' is not available`)
      process.exit(1)
      return
    }

    if(err.message.indexOf(`fatal: Not a git repository (or any of the parent directories): .git`) !== -1) {
      console.error('This directory does not contain a git repository')
      process.exit(1)
      return
    }

    console.error(err.message)
  }
  
}

run()

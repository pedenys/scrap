import axios from 'axios'
import $ from 'cheerio'
const url = 'https://www.unephraseducheckout.fr'

const getAuthorAndJobObject = (authorAndJobRaw) => {
  const authorAndJob = authorAndJobRaw.replace('\n', '')
  var authorRegex = /^(.*)\s*-\s*(.*)$/i
  var authorMatchingGroups = authorRegex.exec(authorAndJob)

  let authorWithJob = {}
  if (authorMatchingGroups) {
    if (authorMatchingGroups[1]) {
      authorWithJob.author = authorMatchingGroups[1].trim()
    }
    if (authorMatchingGroups[2]) {
      authorWithJob.job = authorMatchingGroups[2].trim()
    }
  }
  return authorWithJob
}

const getFormattedQuote = (quote) => {
  const authorWithJob = $('.subtitle', quote).text()
  let formattedQuote = getAuthorAndJobObject(authorWithJob)
  const quoteContent = $('.title', quote).text()
  formattedQuote.quoteContent = quoteContent.trim().replace('\n', '')

  return formattedQuote
}

exports.handler = async () => {
  let isSuccess
  try {
    // whatever the error, data or JS, we throw
    const html = await axios(url).data

    let allQuotes = $("div[class*='quote-']", html)
    allQuotes =
      allQuotes && allQuotes.map((i, quote) => getFormattedQuote(quote))

    allQuotes = Object.values(allQuotes).slice(0, allQuotes.length)
    isSuccess = allQuotes ? true : false
  } catch (error) {
    isSuccess = false
  }

  return {
    statusCode: isSuccess ? 200 : 500,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: isSuccess
      ? JSON.stringify(allQuotes)
      : 'Internal error service : ¯\\_(ツ)_/¯ ',
  }
}

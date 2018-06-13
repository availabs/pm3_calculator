const { createReadStream } = require('fs');
const { spawn } = require('child_process');
const { isAbsolute, join, extname } = require('path');

const csv = require('fast-csv');

const streamOptions = { encoding: 'utf8' };

// Returns an asyncIterator that produces an object for each CSV row.
const createCSVIterator = ({ csvPath, stream }) => {
  if (!(csvPath || stream)) {
    throw new Error('An csvPath or stream parameter is required');
  }

  let inputStream = stream;

  if (!inputStream) {
    const absolutePath = isAbsolute(csvPath)
      ? csvPath
      : join(process.cwd, csvPath);

    const csvFileType = extname(absolutePath).toLowerCase();

    switch (csvFileType) {
      // Uncompressed input CSV. Just create (or send the passed in) read stream.
      case '.csv': {
        inputStream = createReadStream(absolutePath, streamOptions);
        break;
      }

      // GZipped input CSV.
      case '.gz': {
        inputStream = spawn('zcat', [absolutePath], streamOptions).stdout;
        break;
      }

      // xz compressed input CSV.
      case '.xz': {
        inputStream = spawn('xzcat', [absolutePath], streamOptions).stdout;
        break;
      }

      // Zipped compressed input CSV.
      case '.zip': {
        inputStream = spawn('unzip', ['-p', absolutePath], streamOptions)
          .stdout;
        break;
      }

      default: {
        throw new Error('Unrecognized CSV file extension.');
      }
    }
  }

  return inputStream.pipe(
    csv({
      headers: true,
      ignoreEmpty: true
    })
  );
};

module.exports = { createCSVIterator };

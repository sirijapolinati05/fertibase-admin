import fs from 'fs';

const filePath = 'C:\\Users\\pavan\\OneDrive\\Desktop\\Fertibase\\src\\components\\JobDetails.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const target = `          {/* APPLY */}
          <button
            onClick={() => setShowForm(true)}
            className="
              w-full md:w-auto
              px-8 py-3
              bg-[#6B412E]
              hover:bg-[#5e1416]
              text-white
              rounded-xl
              font-semibold
              shadow-md
              transition-all
            "
          >
            Apply Now
          </button>`;

const replacement = `          {/* APPLY */}
          {job.role === "Closed" ? (
            <button
              disabled
              className="w-full md:w-auto px-8 py-3 bg-red-100 text-red-500 rounded-xl font-semibold cursor-not-allowed border border-red-200 shadow-inner"
            >
              Application Closed
            </button>
          ) : job.role === "Filled" ? (
            <button
              disabled
              className="w-full md:w-auto px-8 py-3 bg-slate-200 text-slate-500 rounded-xl font-semibold cursor-not-allowed border border-slate-300"
            >
              Position Filled
            </button>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="
                w-full md:w-auto
                px-8 py-3
                bg-[#6B412E]
                hover:bg-[#5e1416]
                text-white
                rounded-xl
                font-semibold
                shadow-md
                transition-all
              "
            >
              Apply Now
            </button>
          )}`;

// Normalize newlines to do the replacement
const normalizedContent = content.replace(/\r\n/g, '\n');
const normalizedTarget = target.replace(/\r\n/g, '\n');
const normalizedReplacement = replacement.replace(/\r\n/g, '\n');

if (normalizedContent.includes(normalizedTarget)) {
  const updatedContent = normalizedContent.replace(normalizedTarget, normalizedReplacement);
  fs.writeFileSync(filePath, updatedContent, 'utf8');
  console.log('Successfully updated JobDetails.jsx!');
} else {
  console.log('Target content not found. Let us print lines around the target:');
  const lines = normalizedContent.split('\n');
  for (let i = 150; i < 180; i++) {
    console.log(`${i}: ${JSON.stringify(lines[i])}`);
  }
}

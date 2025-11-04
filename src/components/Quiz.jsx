import { useState } from 'react'

export default function Quiz({ questions = [] }) {
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)

  const submit = (e) => {
    e.preventDefault()
    let correct = 0
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correct) correct++
    })
    setResult(`نتيجتك: ${correct} / ${questions.length}`)
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="p-6 text-center border border-gray-200 rounded-lg bg-gray-50 text-gray-500">
        لا يوجد اختبار قصير لهذه الاستراتيجية.
      </div>
    )
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6 mt-6 bg-white shadow-sm">
      <h4 className="font-semibold text-qassimIndigo mb-4 text-center text-lg">
        اختبار تقويمي قصير
      </h4>

      <form onSubmit={submit} className="space-y-6">
        {questions.map((q, idx) => (
          <div key={idx} className="border-b pb-4">
            <p className="font-medium text-qassimDark mb-2">
              {idx + 1}. {q.question}
            </p>
            <div className="space-y-2">
              {q.options.map((opt, i) => (
                <label key={i} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name={`q-${idx}`}
                    value={i}
                    onChange={() => setAnswers({ ...answers, [idx]: i })}
                    className="text-qassimIndigo focus:ring-qassimLight"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

<button
  type="submit"
  className="block mx-auto text-center w-full sm:w-auto px-6 py-2 mt-4 bg-qassimIndigo text-white font-semibold rounded-lg shadow-sm hover:bg-qassimLight transition"
>
  تحقق من الإجابات
</button>

      </form>

      {result && (
        <p className="mt-4 text-center font-semibold text-qassimDark bg-gray-50 py-2 rounded-lg">
          {result}
        </p>
      )}
    </div>
  )
}

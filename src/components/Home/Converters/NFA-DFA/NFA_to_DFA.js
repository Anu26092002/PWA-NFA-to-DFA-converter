import * as yup from 'yup'
import { /*useEffect, */ useState } from 'react';
// import { yupResolver } from '@hookform/resolvers/yup'
// import { useForm,useFieldArray } from 'react-hook-form'
// import axios from 'axios'


// eslint-disable-next-line
let schema = yup.object().shape({
    inputSymbols: yup.string().required(),
    transitions: yup.array().of(
        yup.object().shape({
            state: yup.string().required(),
            nextState: yup.string().required(),
            transitionSymbol: yup.string().required(),
        })
    ),
    startState: yup.string().required(),
    finalStates: yup.string().required(),
    inputString: yup.string().required(),
});

function NFA_to_DFA() {

    const [dfaTable, setDfaTable] = useState(null);

    // here index is the curr state
    const test = [
        {
            a: ['0', '1'],
            b: ['0'],
        },
        {
            a: [],
            b: ['2'],
        },
        {
            a: ['2'],
            b: ['2'],
        },
    ]

    const symbols = ['a', 'b']
    const start = '0'
    const finalStates = ['2']


    const uniqueArray = (arr) => {
        return Array.from(new Set(arr.map(JSON.stringify))).map(JSON.parse);
    }

    const evaluate_NFA_to_DFA = () => {
        let i = 0;
        var prev = 0;
        var answerArray = [];
        let newStates = [];
        var curr = 1;

        newStates.push([start])

        while (prev !== curr) {
            prev = newStates.length;

            const rowAdd = {}

            for (let index = 0; index < symbols.length; index++) {
                const symbol = symbols[index];
                var toBeAddedToSet = [];

                for (let newState = 0; newState < newStates[i].length; newState++) {
                    const element = newStates[i][newState];

                    toBeAddedToSet.push(...test[element][symbol])
                }

                toBeAddedToSet = uniqueArray(toBeAddedToSet);

                newStates.push(toBeAddedToSet);
                newStates = uniqueArray(newStates);

                rowAdd[symbol] = toBeAddedToSet
            }
            let tempNewStates = newStates[i]
            const isFinalState = finalStates.every(k => tempNewStates.includes(k));
            answerArray.push({ state: newStates[i], ...rowAdd , isFinalState})
            curr = newStates.length;
            i++
        }
        console.log('Final Answer', answerArray)
        setDfaTable(answerArray);

    }

    // useEffect(() => {
    //     evaluate_NFA_to_DFA()
    // })
    //  Do not un-Comment

    const getDfaTable = () => {
        return (
            <table className='min-w-full divide-y divide-gray-200 mb-2'>
                <thead className='bg-gray-50'>
                    <tr><th rowSpan='2' className="
                  px-6
                  py-3
                  text-center text-auto
                  font-auto
                  text-gray-500
                  uppercase
                  tracking-wider
                  divide-y divide-gray-200
                "
                    >States</th><th colSpan={symbols.length} className="
                  px-6
                  py-3
                  text-center text-auto
                  font-auto
                  text-gray-500
                  uppercase
                  tracking-wider
                "
                    >Symbols</th></tr>
                    <tr>{symbols.map((symbol, key) =>
                        <th key={key} className="
                        px-6
                        py-3
                        text-center text-auto
                        font-auto
                        text-gray-500
                        uppercase
                        tracking-wider
                      "
                        >{symbol}</th>)}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {dfaTable.map((row, key) => <tr key={key}><td className="px-6 py-4 whitespace-nowrap text-center text-auto"><span className='text-red-600 font-lg'>{row.isFinalState?'*':''}</span>{ row.state.toString()}</td>
                        {symbols.map((symbol, key) =>
                            <td key={key} className='text-center text-auto'>{row[symbol].toString()}</td>)}
                    </tr>)}
                </tbody>
            </table>
        )
    }

    return (
        <div className='min-h-screen dark:text-white p-10 transition duration-500'>
            I will Convert NFA to DFA

            <div className="space-y-4">
                <div className="block bg-green-300 border-b-8 border-r-8 shadow-lg border-green-700 rounded-md w-75 ml-auto my-5" style={{ minHeight: '30vh' }} >

                </div>
                <div className="block grid bg-pink-300 border-b-8 border-r-8 shadow-lg border-pink-700 rounded-md w-75 mr-auto my-5" style={{ minHeight: '30vh' }}>
                    {/* Displaying the state transition table */}
                    {dfaTable ? getDfaTable():''}
                    <div className="grid grid-cols-12 gap-4 mt-auto mb-2">
                        <input type="button" value="Convert " className='col-end-12 col-span-3 py-2 bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded'
                            onClick={evaluate_NFA_to_DFA} />
                    </div>
                </div>
                <div className="block bg-purple-300 border-b-8 border-r-8 shadow-lg border-purple-700 rounded-md w-75 ml-auto my-5" style={{ minHeight: '30vh' }}>

                </div>
                <div className="block bg-blue-300 border-b-8 border-r-8 shadow-lg border-blue-700 rounded-md w-75 mr-auto my-5" style={{ minHeight: '30vh' }}>

                </div>
            </div>
        </div>
    )
}

export default NFA_to_DFA

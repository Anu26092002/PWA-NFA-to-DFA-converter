import * as yup from 'yup'
import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTimesCircle } from 'react-icons/fa'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, useFieldArray } from 'react-hook-form'


// eslint-disable-next-line
let schema = yup.object().shape({
    inputSymbols: yup.string().required(),
    states: yup.string().required(),
    transitions: yup.array().of(
        yup.object().shape({
            currentState: yup.string().required(),
            transitionSymbol: yup.string().required(),
            nextState: yup.string().required(),
        })
    ),
    startState: yup.string().required(),
    finalStates: yup.string().required(),
    inputString: yup.string().required(),
});

function NFA_TO_DFA() {
    console.log("ehl")
    const [dfaTable, setDfaTable] = useState(null);
    const [dfaImage, setDfaImage] = useState(null);
    const [acceptanceStatus, setAcceptanceStatus] = useState(null);

    const { register, /*handleSubmit,*/ formState: { errors }, /*setValue,*/ getValues, control, /*reset*/ } = useForm({
        resolver: yupResolver(schema),
    })

    const transitionFields = useFieldArray({
        control,
        name: "transitions"
    })

    // here index is the curr state
    // const test = [
    //     {
    //         a: ['0', '1'],
    //         b: ['0'],
    //     },
    //     {
    //         a: [],
    //         b: ['2'],
    //     },
    //     {
    //         a: [],
    //         b: [],
    //     },
    // ]

    useEffect(() => {
        // console.log(errors)
    }, [errors])

    const uniqueArray = (arr) => {
        return Array.from(new Set(arr.map(JSON.stringify))).map(JSON.parse);
    }

    const evaluate_NFA_to_DFA = () => {
        // console.log(errors)
        try {
            //Initialising the json array
            const jsonArray = []
            var XStates = getValues('states').split(" ")
            // console.log("States", XStates)
            var XSymbols = getValues('inputSymbols').split(" ")
            // console.log("Symbols", XSymbols)

            for (let i = 0; i < XStates.length; i++) {
                let tempObj = {}
                for (let j = 0; j < XSymbols.length; j++) {
                    tempObj[XSymbols[j]] = []
                }
                // console.log(tempObj)
                jsonArray.push(tempObj)
            }
            // console.log(jsonArray)

            //Filling the array
            var XTransitions = getValues('transitions')
            // console.log(XTransitions)

            for (let i = 0; i < XTransitions.length; i++) {
                var row = XTransitions[i]
                jsonArray[row.currentState][row.transitionSymbol] = [...jsonArray[row.currentState][row.transitionSymbol], row.nextState]
            }

            let i = 0;
            var test = jsonArray
            var prev = 0
            var answerArray = [];
            let newStates = [];
            var curr = 1;
            var symbols = XSymbols
            const start = getValues('startState')[0]
            const finalStates = getValues('finalStates').split(" ")
            // console.log("Start=>", start, "Symb", symbols, "test ", test,)

            newStates.push([start])

            while (prev !== curr) {
                prev += newStates.length > prev ? 1 : 0;

                const rowAdd = {}

                for (let index = 0; index < symbols.length; index++) {
                    const symbol = symbols[index];
                    var toBeAddedToSet = [];

                    for (let newState = 0; newState < newStates[i].length; newState++) {
                        const element = newStates[i][newState];
                        // console.log(test)
                        toBeAddedToSet.push(...test[element][symbol])
                    }

                    toBeAddedToSet = uniqueArray(toBeAddedToSet);
                    newStates.push(toBeAddedToSet);
                    newStates = uniqueArray(newStates);

                    rowAdd[symbol] = toBeAddedToSet.toString()
                }
                // console.log(newStates)
                let tempNewStates = newStates[i]
                // console.log(finalStates)

                var isFinalState = finalStates.some(n => tempNewStates.some(h=> h===n))

                answerArray.push({ state: newStates[i].toString(), ...rowAdd, isFinalState })
                curr += newStates.length > prev ? 1 : 0;
                // console.log(prev, curr, i)
                i++
                // console.log(prev, curr, i)

            }
            // console.log('Final Answer', answerArray)

            setDfaTable(answerArray);
            // console.log(dfaTable);
        }
        catch (Exception) {
            // console.log(Exception)
        }
    }

    useEffect(() => {
        if (dfaTable) {
            visualize()
        }
        // eslint-disable-next-line
    }, [dfaTable])

    useEffect(() => {
        transitionFields.append({
            currentState: "",
            nextState: "",
            transitionSymbol: "",
        })
        // eslint-disable-next-line
    }, [])

    //Function to visualize the DFA
    const visualize = () => {
        try {
            let finalString = 'digraph G {rankdir=LR;size="8,5";'
            var symbols = getValues('inputSymbols').split(" ")

            //Setting the final states (double circle)
            let doubleCircle = 'node [shape = doublecircle,color = darkturquoise]'

            //Setting the non-final states (circle)
            let circle = 'node [shape = circle, color = black];'
            let plain = '"start" [shape = plain];'

            //initial (Start) state

            let init = `"start" -> "${getValues('startState')[0]}";`
            let transition = ''

            for (let i = 0; i < dfaTable.length; i++) {
                let row = dfaTable[i];

                if (row.isFinalState) {
                    doubleCircle += ` "${row.state}"`
                }

                for (const symbolIdx in symbols) {
                    const symbol = symbols[symbolIdx]
                    // console.log('row=>', row, 'symbol=>', symbol)
                    var tempTransition = `"${row.state === "" ? `Φ` : row.state}" -> "${row[symbol] === "" ? `Φ` : row[symbol]}" [label = "${symbol}"];`
                    transition += " " + tempTransition
                }

            }
            doubleCircle += ';'
            // console.log(doubleCircle)
            // console.log(transition);

            var diagraph = finalString + doubleCircle + circle + plain + init + transition + '}'
            // console.log(diagraph)

            axios.get(`https://quickchart.io/graphviz?graph=${diagraph}`)
                .then((image) => {
                    if (image.data)
                        setDfaImage(encodeURIComponent(image.data))
                })
                .catch((error) => {
                    // console.log(error.response)
                    setDfaImage(null)
                })

        }
        catch (Exception) {
            // console.log(Exception)
        }


    }


    const getDfaTable = () => {
        // console.log(dfaTable)
        var symbols = getValues('inputSymbols').split(" ")
        return (
            <table className='divide-y divide-gray-200 m-2 mx-auto w-75'>
                <thead className='border-8 border-white '>
                    <tr><th rowSpan='2' className="
                  px-4
                  py-1
                  text-center text-auto
                  font-auto
                  text-gray-500
                  uppercase
                  tracking-wider
                  divide-y divide-gray-200
                "
                    >States</th><th colSpan={symbols.length} className="
                  px-4
                  py-1
                  text-center text-auto
                  font-auto
                  text-gray-500
                  uppercase
                  tracking-wider
                "
                    >Symbols</th></tr>
                    <tr>{symbols.map((symbol, key) =>
                        <th key={key} className="
                        px-4
                        py-1
                        text-center text-auto
                        font-auto
                        text-gray-500
                        uppercase
                        tracking-wider
                      "
                        >{symbol}</th>)}
                    </tr>
                </thead>
                <tbody className="">
                    {dfaTable.map((row, key) => <tr key={key} className='border-8 border-white '>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-auto"><span className='text-red-600 font-lg'>{row.isFinalState ? '*' : ''}</span>{row.state.toString() === "" ? 'Φ' : row.state.toString()}</td>
                        {symbols.map((symbol, key) =>
                            <td key={key} className='text-center text-auto'>{row[symbol] ? row[symbol].toString() : 'Φ'}</td>)}
                    </tr>)}
                </tbody>
            </table>
        )
    }

    const stringValid = () => {

        try {

            const str = getValues('inputString')

            //Setting the current state
            let curr = getValues('startState')[0]
            let currRow;
            // console.log(str.length)
            for (var i = 0; i < str.length; i++) {
                const char = str[i];
                // eslint-disable-next-line
                currRow = dfaTable.filter(obj => {
                    return obj.state === curr
                })[0]
                curr = currRow[char]
            }
            // eslint-disable-next-line
            currRow = dfaTable.filter(obj => {
                return obj.state === curr
            })[0]
            setAcceptanceStatus(currRow.isFinalState)
        }
        catch (Exception) {
            // console.log(Exception)
        }
    }


    return (
        <div className='min-h-screen dark:text-white p-10 transition duration-500'>
            <h2 className="font-sans md:font-serif">I will Convert your NFA to DFA!</h2>

            <div className="space-y-4">

                {/* Section-1 */}
                <div className="block bg-green-300 border-b-8 border-r-8 shadow-lg py-4 border-green-700 rounded-md w-full md:w-3/4 ml-auto my-5 " style={{ minHeight: '30vh' }} >
                    <div className="bg-green-700 text-xl w-1/2 md:w-1/4 mx-auto rounded-full py-1 px-2 text-center text-white mb-3 ">Input Fields</div>

                    <div className="grid grid-rows gap-4">
                        <div className="row-span-1  py-2">
                            <input className="shadow appearance-none border rounded w-75 ml-6 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="inputSymbols" type="text" placeholder="Input Symbols (Space Separated)"  {...register('inputSymbols')} />
                        </div>
                        <div className="row-span-1 items-center py-2">
                            <input className="shadow appearance-none border rounded w-75 ml-6 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="startState" type="text" placeholder="States (Space Separated)"  {...register('states')} />
                        </div>
                        <div className="row-span-1 items-center py-2">
                            <div className="grid grid-cols-2 gap-4 w-75 ml-6 ">
                                <div className="col-span-1">
                                    <input className="shadow appearance-none border w-100 rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="finalStates" type="text" placeholder="Start State (Space Separated)"  {...register('startState')} />
                                </div>
                                <div className="col-span-1">
                                    <input className="shadow appearance-none border w-100 rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="finalStates" type="text" placeholder="Final States (Space Separated)"  {...register('finalStates')} />
                                </div>
                            </div>
                        </div>
                        <div className="row-span-1 flex items-center py-2 ">
                            {/* <input className="shadow appearance-none border rounded w-75 mx-auto py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="finalStates" type="text" placeholder="Final States (Space Separated)"  {...register('finalStates')} /> */}
                            {/* Field Array Implementation */}
                            <div className="container">
                                <div className="grid grid-flow-row ">
                                    <div className="grid grid-cols-10 mb-2 pb-2 border-b-2 border-gray-100 gap-2">
                                        <div className="col-span-3 text-center shadow appearance-none border rounded py-2 px-3 text-white bg-green-500 leading-tight focus:outline-none focus:shadow-outline" >Current State</div>
                                        <div className="col-span-3 text-center shadow appearance-none border rounded py-2 px-3 text-white bg-green-500 leading-tight focus:outline-none focus:shadow-outline" >Next State</div>
                                        <div className="col-span-3 text-center shadow appearance-none border rounded py-2 px-3 text-white bg-green-500 leading-tight focus:outline-none focus:shadow-outline" >Transiton Symbol</div>
                                    </div>
                                    {transitionFields.fields.map((value, key) => {
                                        return (
                                            <div key={value.id} className="container">
                                                <div className="row-span-1">
                                                    <div className="grid grid-cols-10 gap-2 mb-2">
                                                        <input className="col-span-3 shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="currentState" type="text" placeholder="Current State"  {...register(`transitions[${key}.currentState]`)} />
                                                        <input className="col-span-3 shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="nextState" type="text" placeholder="Next State"  {...register(`transitions[${key}.nextState]`)} />
                                                        <input className="col-span-3 shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="transitionSymbol" type="text" placeholder="Transition Symbol"  {...register(`transitions[${key}.transitionSymbol]`)} />
                                                        <div className="col-span-1 text-red-500 text-lg text-center flex justify-center" >
                                                            &nbsp;
                                                            <FaTimesCircle className='m-auto' onClick={() => transitionFields.remove(key)} style={{ cursor: 'pointer' }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    <div className="flex justify-end mt-4">
                                        <input type="button" value="Add a transition" aria-label="Click here to add a transtion" className='col-end-7 col-span-3  bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-4 border-b-4 border-green-700 hover:border-green-500 rounded'
                                            onClick={() => {
                                                transitionFields.append({
                                                    currentState: "",
                                                    nextState: "",
                                                    transitionSymbol: "",
                                                })
                                            }} />
                                    </div>
                                </div>

                            </div>


                        </div>
                    </div>
                </div>

                {/* Section-2 */}
                <div className="block bg-pink-300 border-b-8 border-r-8 shadow-lg border-pink-700  items- rounded-md w-full md:w-3/4 mr-auto my-5 px-4 py-3 overflow-x-auto grid-flow-row" style={{ minHeight: '30vh' }}>
                    <div className="bg-red-700 text-xl w-1/2 md:w-1/4 mx-auto rounded-full py-1 px-2 text-center text-white mb-3 ">Transition Table</div>

                    {/* Displaying the state transition table */}
                    {dfaTable ? getDfaTable() : ''}
                    <div className="grid grid-cols-12 mb-2 mt-auto">
                        <input type="button" value="Convert" aria-label="Click here to convert NFA into DFA" className='col-end-12 col-span-6  bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded'
                            onClick={evaluate_NFA_to_DFA} />
                    </div>
                </div>

                {/* Section-3 */}

                <div className="block bg-purple-300 border-b-8 border-r-8 shadow-lg border-purple-700 rounded-md w-full md:w-3/4 ml-auto my-5 py-2" style={{ minHeight: '30vh' }}>
                    <div className="bg-purple-700 text-xl w-1/2 md:w-1/4 mx-auto rounded-full py-1 px-2 text-center text-white mb-3 ">DFA Diagram</div>
                    {
                        dfaImage && <embed src={`data:image/svg+xml,${dfaImage}`} className='object-contain h-64 w-full' alt="dfa" />

                    }
                </div>

                {/* Section-4 */}
                <div className="block bg-blue-300 border-b-8 border-r-8 shadow-lg border-blue-700 rounded-md w-full md:w-3/4 mr-auto my-5 py-2" style={{ minHeight: '30vh' }}>
                    <div className="bg-blue-700 text-xl w-1/2 md:w-1/4 mx-auto rounded-full py-1 px-2 text-center text-white mb-3 ">Test A String</div>

                    <div className="container text-gray-700 text-sm font-bold my-2">
                        <div className="row mb-4">
                            <input className="shadow appearance-none border rounded mx-auto w-75 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="inputString" type="text" placeholder="Input String"  {...register('inputString')} />
                        </div>


                        <div className="grid grid-cols-8">
                            <input type="button" value="Check" aria-label="Click here to check generated DFA" className='col-end-6 col-span-2  bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-4 border-b-4 border-green-700 hover:green-blue-500 rounded'
                                onClick={stringValid} />
                        </div>
                        {acceptanceStatus === true ?
                            <div className="bg-green-500 text-xl w-1/2 md:w-1/4 mx-auto rounded-full py-1 px-2 text-center mt-4 text-white mb-3 ">String Accepted</div>
                            : (acceptanceStatus === false ?
                                <div className="bg-red-600 text-xl w-25 mx-auto rounded-2xl py-1 px-2 text-center mt-4 text-white mb-3 ">String Rejected</div>
                                : '')}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NFA_TO_DFA

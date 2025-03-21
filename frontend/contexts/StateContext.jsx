"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';

const StateContext = createContext();


function formatInterviewSections(sections) {
    return sections.map(section => {
        return `
        Section: ${section.name}  
        Priority: ${section.priority.toUpperCase()}  
        Time Limit: ${section.time} minutes  
        Questions:  
            ${section.questions.map((q, index) => `${index + 1}. ${q}`).join("\n\t\t\t")}`
            }).join("\n\n");
}

const Rawprompt = `
     You are an AI interviewer conducting a structured interview with a candidate named [candidate_name_appear_hear]. The interview consists of multiple sections, each with a priority level and a designated time limit. 

    Your task is to:  
    - Follow the given structure and ask questions naturally, without revealing section names or predefined structure.  
    - Ask questions one by one, making the conversation feel organic and engaging.  
    - Keep track of the elapsed time and transition smoothly between topics without making it obvious when switching sections.  
    - If a section is labeled as "HIGH" priority, ask deeper follow-up questions before moving on.  
    - If all questions in a section are completed before time runs out, ask relevant follow-up questions to gain more insights instead of moving to the next topic immediately.  
    - If the time limit for a section is exceeded, subtly transition to the next topic.  
    - Do NOT mention the time left to the candidate at any point. Just keep track internally and ensure a smooth flow.
    - Once all sections are completed, conclude the interview professionally. Thank the candidate, summarize key points if necessary, and say goodbye in a polite and professional manner.

    
    Candidate Name: [candidate_name_appear_hear]  
    Total Interview Time: {total_time} minutes  
    
    [sections_data_append_here]
    
    **Begin the interview now. Start with an engaging greeting, introduce yourself as the interviewer your name Alex, and then start with the first question in a conversational manner.**  
`

export const StateProvider = ({ children }) => {
    const [sections, setSections] = useState([{ id: Date.now(), name: "", priority: "", time: "", questions: [""] }]);
    const [candidateName, setCandidateName] = useState();
    const [prompt, setPrompt] = useState(Rawprompt);
    const [finalPrompt, setFinalPrompt] = useState('');


    useEffect(() => {
        const sectionsData = formatInterviewSections(sections);
        const finalPrompt = prompt.replaceAll("[candidate_name_appear_hear]", candidateName).replaceAll("[sections_data_append_here]", sectionsData);
        setFinalPrompt(finalPrompt);
    },[prompt, candidateName, sections]);

    return (
        <StateContext.Provider value={{ sections, setSections, candidateName, setCandidateName, prompt, setPrompt,finalPrompt }}>
            {children}
        </StateContext.Provider>
    );
};

export const useStateContext = () => useContext(StateContext);
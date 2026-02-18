
import { GoogleGenAI, Type } from "@google/genai";
import { RSVPGroup, SleepingUnit, RSVPStatus } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getSmartAssignments = async (groups: RSVPGroup[], rooms: SleepingUnit[]) => {
  const guestList = groups
    .map(g => ({
      id: g.id,
      name: g.contactName,
      size: g.members.length,
      members: g.members.map(m => m.category),
      prefersQuiet: g.prefersQuiet,
      prefersNoPaws: g.prefersNoPaws,
      status: g.status,
      likelihood: g.likelihood || (g.status === RSVPStatus.YES ? 100 : 0)
    }));

  const roomConfig = rooms.map(r => ({
    id: r.id,
    name: r.name,
    capacity: r.capacity,
    beds: r.beds,
    isHost: r.isHostRoom
  }));

  const prompt = `
    Task: You are Brian's helpful house-guest matchmaker for the Gunstock Acres weekend. Suggest who should sleep where.
    
    House Layout:
    ${JSON.stringify(roomConfig, null, 2)}
    
    The Guest List (includes firm 'YES' and likely 'MAYBE' guests):
    ${JSON.stringify(guestList, null, 2)}
    
    Guidelines for a happy house:
    1. The room marked as 'isHost: true' is taken by Brian and his partner. Do not assign anyone else there.
    2. Bedroom 1 (Master) is open and available for guests!
    3. PRIORITY: If beds are limited, prioritize guests with status 'YES' (likelihood 100) over 'MAYBE' guests.
    4. Keep groups/families together in one room.
    5. "Prefers Quiet" guests should be kept away from "Child" or "Baby" categories if possible.
    6. "Prefers No Paws" guests shouldn't share a room with "Dog" categories.
    7. Don't exceed room capacity unless it's a baby in a pack-n-play (which doesn't really take a bed spot).
    8. Use the likelihood score to decide who gets the "better" spots if multiple 'MAYBE' groups are competing for the last bed.
    
    Return JSON:
    {
       "assignments": [{"roomId": "id", "groupId": "id"}],
       "reasoning": "A friendly, casual explanation of why this works, mentioning how you handled confirmed vs likely guests.",
       "conflicts": ["Any awkward bed situations or waitlisted groups if over capacity"]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            assignments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  roomId: { type: Type.STRING },
                  groupId: { type: Type.STRING }
                }
              }
            },
            reasoning: { type: Type.STRING },
            conflicts: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

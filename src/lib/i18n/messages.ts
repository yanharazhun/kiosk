import type { Locale } from "./locale";

const en = {
  brand: "Ember & Bun",
  welcomeTitle: ["Smashed.", "Stacked.", "Yours."],
  welcomeLead:
    "Order and pay right here. We'll call your number the moment it's off the grill.",
  start: "Tap to start your order",
  modeTitle: "Where are you eating today?",
  eatIn: "Eat here",
  eatInHint: "Served on a tray at the counter",
  takeAway: "Take away",
  takeAwayHint: "Packed in a bag to go",
  change: "Change",
  startOver: "Start over",
  itemCount: (count: number) => (count === 1 ? "1 item" : `${count} items`),
  emptyOrder: "Your order is empty",
  emptyOrderHint: "Tap any item to add it",
  emptyMenu: "Nothing on the menu right now",
  photo: "Photo",
  makeItMeal: "Make it a meal",
  mealHint: (price: string) => `With a side and a drink · +${price}`,
  addExtras: "Add extras",
  leaveOff: "Leave something off",
  without: (name: string) => `No ${name.toLowerCase()}`,
  addToOrder: "Add to order",
  close: "Close",
  decreaseQuantity: "Decrease quantity",
  increaseQuantity: "Increase quantity",
};

type Messages = typeof en;

const da: Messages = {
  brand: "Ember & Bun",
  welcomeTitle: ["Smashet.", "Stablet.", "Din."],
  welcomeLead:
    "Bestil og betal lige her. Vi råber dit nummer op, så snart det er klar fra grillen.",
  start: "Tryk for at starte din bestilling",
  modeTitle: "Hvor spiser du i dag?",
  eatIn: "Spis her",
  eatInHint: "Serveres på en bakke ved disken",
  takeAway: "Tag med",
  takeAwayHint: "Pakket i en pose til at tage med",
  change: "Skift",
  startOver: "Start forfra",
  itemCount: (count: number) => (count === 1 ? "1 vare" : `${count} varer`),
  emptyOrder: "Din bestilling er tom",
  emptyOrderHint: "Tryk på en vare for at tilføje den",
  emptyMenu: "Der er intet på menuen lige nu",
  photo: "Foto",
  makeItMeal: "Gør det til en menu",
  mealHint: (price: string) => `Med tilbehør og drik · +${price}`,
  addExtras: "Tilføj ekstra",
  leaveOff: "Udelad noget",
  without: (name: string) => `Uden ${name.toLowerCase()}`,
  addToOrder: "Tilføj til bestilling",
  close: "Luk",
  decreaseQuantity: "Færre",
  increaseQuantity: "Flere",
};

export const messages: Record<Locale, Messages> = { en, da };

export type { Messages };

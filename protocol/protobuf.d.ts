
namespace protobuf {
    // DO NOT EDIT! This is a generated file. Edit the JSDoc in src/*.js instead and run 'npm run build:types'.

/** Namespace protobuf. */
export namespace protobuf {

    /** Properties of a Join. */
    interface IJoin {

        /** Join ID */
        ID?: (string|null);

        /** Join GameState */
        GameState?: (string|null);

        /** Join AllPlayers */
        AllPlayers?: (string[]|null);
    }

    /** Represents a Join. */
    class Join implements IJoin {

        /**
         * Constructs a new Join.
         * @param [properties] Properties to set
         */
        constructor(properties?: protobuf.IJoin);

        /** Join ID. */
        public ID: string;

        /** Join GameState. */
        public GameState: string;

        /** Join AllPlayers. */
        public AllPlayers: string[];

        /**
         * Creates a new Join instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Join instance
         */
        public static create(properties?: protobuf.IJoin): protobuf.Join;

        /**
         * Encodes the specified Join message. Does not implicitly {@link protobuf.Join.verify|verify} messages.
         * @param message Join message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: protobuf.IJoin, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Join message, length delimited. Does not implicitly {@link protobuf.Join.verify|verify} messages.
         * @param message Join message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: protobuf.IJoin, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Join message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Join
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): protobuf.Join;

        /**
         * Decodes a Join message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Join
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): protobuf.Join;

        /**
         * Verifies a Join message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Join message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Join
         */
        public static fromObject(object: { [k: string]: any }): protobuf.Join;

        /**
         * Creates a plain object from a Join message. Also converts values to other types if specified.
         * @param message Join
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: protobuf.Join, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Join to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Join
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a Move. */
    interface IMove {

        /** Move ID */
        ID?: (string|null);

        /** Move IsGoRight */
        IsGoRight?: (boolean|null);
    }

    /** Represents a Move. */
    class Move implements IMove {

        /**
         * Constructs a new Move.
         * @param [properties] Properties to set
         */
        constructor(properties?: protobuf.IMove);

        /** Move ID. */
        public ID: string;

        /** Move IsGoRight. */
        public IsGoRight: boolean;

        /**
         * Creates a new Move instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Move instance
         */
        public static create(properties?: protobuf.IMove): protobuf.Move;

        /**
         * Encodes the specified Move message. Does not implicitly {@link protobuf.Move.verify|verify} messages.
         * @param message Move message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: protobuf.IMove, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Move message, length delimited. Does not implicitly {@link protobuf.Move.verify|verify} messages.
         * @param message Move message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: protobuf.IMove, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Move message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Move
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): protobuf.Move;

        /**
         * Decodes a Move message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Move
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): protobuf.Move;

        /**
         * Verifies a Move message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Move message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Move
         */
        public static fromObject(object: { [k: string]: any }): protobuf.Move;

        /**
         * Creates a plain object from a Move message. Also converts values to other types if specified.
         * @param message Move
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: protobuf.Move, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Move to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Move
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a Stop. */
    interface IStop {

        /** Stop ID */
        ID?: (string|null);

        /** Stop IsStopGoRight */
        IsStopGoRight?: (boolean|null);
    }

    /** Represents a Stop. */
    class Stop implements IStop {

        /**
         * Constructs a new Stop.
         * @param [properties] Properties to set
         */
        constructor(properties?: protobuf.IStop);

        /** Stop ID. */
        public ID: string;

        /** Stop IsStopGoRight. */
        public IsStopGoRight: boolean;

        /**
         * Creates a new Stop instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Stop instance
         */
        public static create(properties?: protobuf.IStop): protobuf.Stop;

        /**
         * Encodes the specified Stop message. Does not implicitly {@link protobuf.Stop.verify|verify} messages.
         * @param message Stop message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: protobuf.IStop, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Stop message, length delimited. Does not implicitly {@link protobuf.Stop.verify|verify} messages.
         * @param message Stop message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: protobuf.IStop, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Stop message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Stop
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): protobuf.Stop;

        /**
         * Decodes a Stop message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Stop
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): protobuf.Stop;

        /**
         * Verifies a Stop message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Stop message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Stop
         */
        public static fromObject(object: { [k: string]: any }): protobuf.Stop;

        /**
         * Creates a plain object from a Stop message. Also converts values to other types if specified.
         * @param message Stop
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: protobuf.Stop, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Stop to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Stop
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }
}

}
export default protobuf;
